<?php
namespace Opencart\Catalog\Controller\Agentapi;

use \Opencart\System\Helper as Helper;

/**
 * Order endpoints for the agent API.
 *
 *   index.php?route=agentapi/order|get       order detail by order_id
 *   index.php?route=agentapi/order|insert    create a pending order for a customer
 *   index.php?route=agentapi/order|reorder   duplicate a past order into a new pending one
 *
 * Auth: Authorization: Bearer <AGENT_API_TOKEN>   (same constant/pattern as agentapi/product.php)
 *
 * insert() and reorder() only ever create PENDING orders: addHistory() is never
 * called from this file, so it is structurally impossible for these endpoints to
 * mark an order paid/processing, trigger stock deduction, or bypass fraud checks -
 * that all stays behind the existing payment gateway calls in checkout/confirm.php.
 * Pricing/stock/option validation is delegated entirely to the real
 * \Opencart\System\Library\Cart\Cart class (the same engine checkout itself uses),
 * never reimplemented here - see buildCartLines().
 */
class Order extends \Opencart\System\Engine\Controller {
	const MAX_PRODUCTS = 50;
	const MAX_QUANTITY = 1000;
	const MAX_COMMENT = 2000;
	const MAX_TEXT = 200;

	// order_status_id set on every agent-created order so it's visible in the
	// backendboard order list (order_status_id = 0 is excluded there). Set via
	// a plain UPDATE (see placeOrder()), never addHistory() - confirm this id
	// matches the intended status in backendboard Settings > Order Statuses.
	const AGENT_ORDER_STATUS_ID = 1;

	public function get(): void {
		$this->authenticate();

		$order_id = (int)($this->request->get['order_id'] ?? 0);

		if ($order_id < 1) {
			$this->fail('missing_order_id', 'order_id is required.', 400);
		}

		$this->load->model('checkout/order');

		if (!$this->model_checkout_order->getOrder($order_id)) {
			$this->fail('not_found', 'No order with id ' . $order_id . '.', 404);
		}

		$this->respond(['success' => true, 'order' => $this->renderOrder($order_id)]);
	}

	public function insert(): void {
		$this->authenticate();

		$input = $this->body();

		$lines = $this->normalizeProductLines($input['products'] ?? null);

		if (!$lines) {
			$this->fail('missing_products', 'products must be a non-empty array.', 400);
		}

		// Validate products before touching the customer table, so a bad
		// product_id never leaves behind an orphan customer record from the
		// create-if-missing path in resolveCustomer().
		$result = $this->buildCartLines($lines, true);

		$customer = $this->resolveCustomer($input);

		$order_id = $this->placeOrder($customer, $result['products'], $input, 'Online');

		$this->respond(['success' => true, 'order' => $this->renderOrder($order_id)], 201);
	}

	public function reorder(): void {
		$this->authenticate();

		$input = $this->body();

		$source_order_id = (int)($input['source_order_id'] ?? 0);

		if ($source_order_id < 1) {
			$this->fail('missing_source_order_id', 'source_order_id is required.', 400);
		}

		$this->load->model('checkout/order');

		$source_order = $this->model_checkout_order->getOrder($source_order_id);

		if (!$source_order) {
			$this->fail('not_found', 'No order with id ' . $source_order_id . '.', 404);
		}

		if (!empty($input['customer_id'])) {
			$customer = $this->resolveCustomer($input);
		} else {
			$this->load->model('account/customer');

			$customer = $this->model_account_customer->getCustomer((int)$source_order['customer_id']);

			if (!$customer) {
				$this->fail('unknown_customer', 'The customer on the source order no longer exists.', 404);
			}
		}

		$lines = [];

		foreach ($this->model_checkout_order->getProducts($source_order_id) as $product) {
			$options = [];

			foreach ($this->model_checkout_order->getOptions($source_order_id, $product['order_product_id']) as $option) {
				$options[] = [
					'product_option_id'       => (int)$option['product_option_id'],
					'product_option_value_id' => (int)$option['product_option_value_id']
				];
			}

			$lines[] = [
				'product_id' => (int)$product['product_id'],
				'quantity'   => max(1, (int)$product['quantity']),
				'options'    => $options
			];
		}

		$result = $this->buildCartLines($lines, false);

		if (!$result['products']) {
			$this->cart->clear();

			$this->fail('no_reorderable_products', 'None of the products on order ' . $source_order_id . ' are currently orderable.', 400);
		}

		$order_id = $this->placeOrder($customer, $result['products'], $input, 'Reorder', $source_order_id);

		$order = $this->renderOrder($order_id);
		$order['source_order_id'] = $source_order_id;
		$order['skipped_products'] = $result['skipped'];

		$this->respond(['success' => true, 'order' => $order], 201);
	}

	/**
	 * Resolve customer_id -> existing customer, or a customer{email,...} block ->
	 * existing customer by email, or a brand-new minimal customer if no match.
	 * Never lets the caller choose customer_group_id or a password.
	 */
	private function resolveCustomer(array $input): array {
		$this->load->model('account/customer');

		if (!empty($input['customer_id'])) {
			$customer_id = (int)$input['customer_id'];
			$customer = $this->model_account_customer->getCustomer($customer_id);

			if (!$customer) {
				$this->fail('unknown_customer', 'No customer with id ' . $customer_id . '.', 404);
			}

			return $customer;
		}

		$data = is_array($input['customer'] ?? null) ? $input['customer'] : [];

		$email = trim((string)($data['email'] ?? ''));

		if ($email === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
			$this->fail('invalid_customer', 'customer_id, or a customer object with a valid email, is required.', 400);
		}

		$existing = $this->model_account_customer->getCustomerByEmail($email);

		if ($existing) {
			return $existing;
		}

		$firstname = $this->text($data['firstname'] ?? '', self::MAX_TEXT);
		$lastname = $this->text($data['lastname'] ?? '', self::MAX_TEXT);

		if ($firstname === '' || $lastname === '') {
			$this->fail('invalid_customer', 'customer.firstname and customer.lastname are required to create a new customer.', 400);
		}

		$customer_id = $this->model_account_customer->addAgentCustomer([
			'firstname' => $firstname,
			'lastname'  => $lastname,
			'email'     => $email,
			'telephone' => $this->text($data['telephone'] ?? '', 32)
		]);

		return $this->model_account_customer->getCustomer($customer_id);
	}

	/**
	 * Validate/shape the request "products" array. Rejects bad input outright
	 * rather than silently coercing it - callers get a clear 400, not a
	 * partially-built order.
	 */
	private function normalizeProductLines($products): array {
		if (!is_array($products) || !$products) {
			return [];
		}

		if (count($products) > self::MAX_PRODUCTS) {
			$this->fail('too_many_products', 'A maximum of ' . self::MAX_PRODUCTS . ' product lines is allowed.', 400);
		}

		$lines = [];

		foreach ($products as $product) {
			if (!is_array($product) || empty($product['product_id'])) {
				$this->fail('invalid_product', 'Each product line requires a product_id.', 400);
			}

			$quantity = (int)($product['quantity'] ?? 1);

			if ($quantity < 1 || $quantity > self::MAX_QUANTITY) {
				$this->fail('invalid_quantity', 'quantity must be between 1 and ' . self::MAX_QUANTITY . '.', 400);
			}

			$options = [];

			if (!empty($product['options']) && is_array($product['options'])) {
				foreach ($product['options'] as $option) {
					if (!is_array($option) || empty($option['product_option_id']) || !isset($option['product_option_value_id'])) {
						continue;
					}

					$options[] = [
						'product_option_id'       => (int)$option['product_option_id'],
						'product_option_value_id' => (int)$option['product_option_value_id']
					];
				}
			}

			$lines[] = [
				'product_id' => (int)$product['product_id'],
				'quantity'   => $quantity,
				'options'    => $options
			];
		}

		return $lines;
	}

	/**
	 * [product_option_id => product_option_value_id] for select/radio; a second
	 * value under the same product_option_id collapses into an array, which is
	 * how Cart::getProducts() recognises a checkbox-style multi-select.
	 */
	private function optionArray(array $options): array {
		$option = [];

		foreach ($options as $pair) {
			$poid = $pair['product_option_id'];
			$povid = $pair['product_option_value_id'];

			if (isset($option[$poid])) {
				$option[$poid] = array_merge((array)$option[$poid], [$povid]);
			} else {
				$option[$poid] = $povid;
			}
		}

		return $option;
	}

	/**
	 * Resolve requested/historical product lines through the REAL cart engine
	 * (system/library/cart/cart.php) instead of a hand-rolled pricing path, so
	 * price, price_prefix, stock, and option-ownership are validated exactly the
	 * way real checkout validates them. Cart::add() performs no validation at
	 * insert time; Cart::getProducts() is what resolves (and silently drops any
	 * row that fails to join against an available product/option).
	 *
	 * $strict = true (insert): any requested line that fails to resolve aborts
	 * the whole request with nothing written.
	 * $strict = false (reorder): failed lines are collected and reported back
	 * instead of aborting.
	 */
	private function buildCartLines(array $lines, bool $strict): array {
		$this->load->model('catalog/agentapi');

		$required = $this->model_catalog_agentapi->getRequiredOptionIds(array_unique(array_column($lines, 'product_id')));

		$this->cart->clear();

		$cart_ids = [];

		foreach ($lines as $index => $line) {
			$this->cart->add($line['product_id'], $line['quantity'], $this->optionArray($line['options']));

			$cart_ids[(int)$this->db->getLastId()] = $index;
		}

		$resolved = [];

		foreach ($this->cart->getProducts() as $product) {
			if (isset($cart_ids[(int)$product['cart_id']])) {
				$resolved[$cart_ids[(int)$product['cart_id']]] = $product;
			}
		}

		$products = [];
		$skipped = [];

		foreach ($lines as $index => $line) {
			if (!isset($resolved[$index])) {
				if ($strict) {
					$this->cart->clear();

					$this->fail('invalid_product', 'product_id ' . $line['product_id'] . ' is not available, out of stock, or its options are invalid.', 400);
				}

				$skipped[] = ['product_id' => $line['product_id'], 'quantity' => $line['quantity'], 'reason' => 'invalid_product'];

				continue;
			}

			$missing = array_diff($required[$line['product_id']] ?? [], array_column($resolved[$index]['option'], 'product_option_id'));

			if ($missing) {
				if ($strict) {
					$this->cart->clear();

					$this->fail('missing_required_option', 'product_id ' . $line['product_id'] . ' is missing a value for required option(s): ' . implode(',', $missing) . '.', 400);
				}

				$skipped[] = ['product_id' => $line['product_id'], 'quantity' => $line['quantity'], 'reason' => 'missing_required_option'];

				continue;
			}

			$products[] = $resolved[$index];
		}

		return ['products' => $products, 'skipped' => $skipped];
	}

	/**
	 * Build order_data in the same shape catalog/controller/api/sale/order.php
	 * ::confirm() builds it, then insert it via the one real order-insert path
	 * (model_checkout_order->addOrder()). Never calls addHistory() - the order
	 * is left at its natural pending default, same as a pre-payment checkout
	 * order, and must be finalised through the existing storefront/admin/
	 * payment flow.
	 */
	private function placeOrder(array $customer, array $cart_products, array $input, string $order_type, int $reorder_id = 0): int {
		$payment = $this->resolveAddress(is_array($input['payment_address'] ?? null) ? $input['payment_address'] : []);
		$shipping = $this->resolveAddress(is_array($input['shipping_address'] ?? null) ? $input['shipping_address'] : []);

		$order_data = [];

		$order_data['invoice_prefix'] = $this->config->get('config_invoice_prefix');
		$order_data['store_id'] = $this->config->get('config_store_id');
		$order_data['store_name'] = $this->config->get('config_name');
		$order_data['store_url'] = $this->config->get('config_url');

		$order_data['customer_id'] = (int)$customer['customer_id'];
		$order_data['customer_group_id'] = (int)$customer['customer_group_id'];
		$order_data['firstname'] = (string)$customer['firstname'];
		$order_data['lastname'] = (string)$customer['lastname'];
		$order_data['email'] = (string)$customer['email'];
		$order_data['telephone'] = (string)$customer['telephone'];
		$order_data['custom_field'] = [];

		$order_data['payment_firstname'] = $this->text($payment['firstname'] ?? $customer['firstname'], self::MAX_TEXT);
		$order_data['payment_lastname'] = $this->text($payment['lastname'] ?? $customer['lastname'], self::MAX_TEXT);
		$order_data['payment_company'] = $this->text($payment['company'] ?? '', self::MAX_TEXT);
		$order_data['payment_address_1'] = $this->text($payment['address_1'] ?? '', self::MAX_TEXT);
		$order_data['payment_address_2'] = $this->text($payment['address_2'] ?? '', self::MAX_TEXT);
		$order_data['payment_city'] = $this->text($payment['city'] ?? '', self::MAX_TEXT);
		$order_data['payment_postcode'] = $this->text($payment['postcode'] ?? '', 32);
		$order_data['payment_country'] = $this->text($payment['country'] ?? '', self::MAX_TEXT);
		$order_data['payment_country_id'] = (int)($payment['country_id'] ?? 0);
		$order_data['payment_zone'] = $this->text($payment['zone'] ?? '', self::MAX_TEXT);
		$order_data['payment_zone_id'] = (int)($payment['zone_id'] ?? 0);
		$order_data['payment_address_format'] = '';
		$order_data['payment_custom_field'] = [];
		$order_data['payment_method'] = isset($input['payment_method']) ? $input['payment_method'] : '';
                $order_data['payment_code'] = isset($input['payment_code']) ? $input['payment_code'] : '';


		$order_data['shipping_firstname'] = $this->text($shipping['firstname'] ?? $customer['firstname'], self::MAX_TEXT);
		$order_data['shipping_lastname'] = $this->text($shipping['lastname'] ?? $customer['lastname'], self::MAX_TEXT);
		$order_data['shipping_company'] = $this->text($shipping['company'] ?? '', self::MAX_TEXT);
		$order_data['shipping_address_1'] = $this->text($shipping['address_1'] ?? '', self::MAX_TEXT);
		$order_data['shipping_address_2'] = $this->text($shipping['address_2'] ?? '', self::MAX_TEXT);
		$order_data['shipping_city'] = $this->text($shipping['city'] ?? '', self::MAX_TEXT);
		$order_data['shipping_postcode'] = $this->text($shipping['postcode'] ?? '', 32);
		$order_data['shipping_country'] = $this->text($shipping['country'] ?? '', self::MAX_TEXT);
		$order_data['shipping_country_id'] = (int)($shipping['country_id'] ?? 0);
		$order_data['shipping_zone'] = $this->text($shipping['zone'] ?? '', self::MAX_TEXT);
		$order_data['shipping_zone_id'] = (int)($shipping['zone_id'] ?? 0);
		$order_data['shipping_address_format'] = '';
		$order_data['shipping_custom_field'] = [];
		$order_data['shipping_method'] = isset($input['shipping_method']) ? $input['shipping_method'] : '';
                $order_data['shipping_code'] = isset($input['shipping_code']) ? $input['shipping_code'] : '';


		$order_data['products'] = [];

		foreach ($cart_products as $product) {
			$option_data = [];

			foreach ((array)$product['option'] as $option) {
				$option_data[] = [
					'product_option_id'       => $option['product_option_id'],
					'product_option_value_id' => $option['product_option_value_id'],
					'name'                    => $option['name'],
					'value'                   => $option['value'],
					'type'                    => $option['type'],
					'price'                   => $option['price']
				];
			}

			$order_data['products'][] = [
				'product_id'    => $product['product_id'],
				'master_id'     => $product['master_id'],
				'name'          => $product['name'],
				'model'         => $product['model'],
				'option'        => $option_data,
				'subscription'  => $product['subscription'],
				'quantity'      => $product['quantity'],
				'price'         => $product['price'],
				'total'         => $product['total'],
				'tax'           => $this->tax->getTax($product['price'], $product['tax_class_id']),
				'reward'        => $product['reward'],
				'laterShipDate' => $product['laterShipDate'] ?? '',
				'address_id'    => $product['address_id'] ?? '',
				'cart_img_id'   => '',
				'size_width'    => $product['size_width'] ?? null,
				'size_height'   => $product['size_height'] ?? null
			];
		}

		$order_data['vouchers'] = [];
		$order_data['comment'] = $this->text($input['comment'] ?? '', self::MAX_COMMENT);

		$totals = [];
		$taxes = $this->cart->getTaxes();
		$total = 0;

		$this->load->model('checkout/cart');

		($this->model_checkout_cart->getTotals)($totals, $taxes, $total);

		if (isset($input['totals']) && is_array($input['totals'])) {
                    $order_data['totals'] = $input['totals'];
                } else {
                    $order_data['totals'] = $totals;
                }

                $order_data['taxes'] = $taxes;

                if (isset($input['total'])) {
                    $order_data['total'] = $input['total'];
                } else {
                $order_data['total'] = $total;
                }


		$order_data['affiliate_id'] = 0;
		$order_data['commission'] = 0;
		$order_data['marketing_id'] = 0;
		$order_data['tracking'] = '';

		$order_data['language_id'] = (int)$this->config->get('config_language_id');
		$order_data['currency_id'] = $this->currency->getId($this->config->get('config_currency'));
		$order_data['currency_code'] = $this->config->get('config_currency');
		$order_data['currency_value'] = $this->currency->getValue($this->config->get('config_currency'));

	        $order_data['ip'] = isset($input['ip']) ? $input['ip'] : (string)($this->request->server['REMOTE_ADDR'] ?? '');
                $order_data['forwarded_ip'] = isset($input['forwarded_ip']) ? $input['forwarded_ip'] : '';
                $order_data['user_agent'] = isset($input['user_agent']) ? $input['user_agent'] : 'agentapi';
		$order_data['accept_language'] = '';

		$this->load->model('checkout/order');

		if ($order_type === 'Reorder') {
			$this->session->data['reorder'] = true;
			$this->session->data['reorder_id'] = $reorder_id;
		}

		try {
			$order_id = $this->model_checkout_order->addOrder($order_data);

			// Plain UPDATE, no side effects (no history row, no stock deduction,
			// no fraud check, no processing/complete-status hooks) - unlike
			// addHistory(), which this file deliberately never calls. Makes the
			// order visible in the backendboard order list (order_status_id = 0
			// rows are excluded there) without weakening the pending-order
			// guarantee documented at the top of this file. Same mechanism used
			// by catalog/model/account/address.php:37.
			$this->model_checkout_order->update_order_status_id($order_id, self::AGENT_ORDER_STATUS_ID);
		} finally {
			$this->cart->clear();
		}

		return $order_id;
	}

	/**
	 * Fill in country/zone text from country_id/zone_id via the existing
	 * localisation models, so an order can't store country_id=223 next to an
	 * empty country name. Only reconciles id -> text; there is no
	 * getCountryByName()/getZoneByName() in this codebase to go the other way.
	 */
	private function resolveAddress(array $address): array {
		$country_id = (int)($address['country_id'] ?? 0);
		$zone_id = (int)($address['zone_id'] ?? 0);

		if ($country_id > 0) {
			$this->load->model('localisation/country');

			$country = $this->model_localisation_country->getCountry($country_id);

			if ($country) {
				$address['country'] = $country['name'];
			}
		}

		if ($zone_id > 0) {
			$this->load->model('localisation/zone');

			$zone = $this->model_localisation_zone->getZone($zone_id);

			if ($zone) {
				$address['zone'] = $zone['name'];
			}
		}

		return $address;
	}

	/**
	 * Full order detail for the order|get response and the order just created
	 * by insert()/reorder().
	 */
	private function renderOrder(int $order_id): array {
		$this->load->model('checkout/order');

		$order = $this->model_checkout_order->getOrder($order_id);

		$products = [];

		foreach ($this->model_checkout_order->getProducts($order_id) as $product) {
			$options = [];

			foreach ($this->model_checkout_order->getOptions($order_id, $product['order_product_id']) as $option) {
				$options[] = [
					'name'  => $option['name'],
					'value' => $option['value'],
					'price' => (float)$option['price']
				];
			}

			$products[] = [
				'order_product_id' => (int)$product['order_product_id'],
				'product_id'       => (int)$product['product_id'],
				'name'             => $product['name'],
				'model'            => $product['model'],
				'quantity'         => (int)$product['quantity'],
				'price'            => (float)$product['price'],
				'total'            => (float)$product['total'],
				'tax'              => (float)$product['tax'],
				'options'          => $options
			];
		}

		$totals = [];

		foreach ($this->model_checkout_order->getTotals($order_id) as $total) {
			$totals[] = [
				'code'  => $total['code'],
				'title' => $total['title'],
				'value' => (float)$total['value']
			];
		}

		$history = [];

		foreach ($this->model_checkout_order->getHistories($order_id) as $entry) {
			$history[] = [
				'order_status_id' => (int)$entry['order_status_id'],
				'order_status'    => $entry['order_status'],
				'comment'         => $entry['comment'],
				'date_added'      => $entry['date_added']
			];
		}

		return [
			'order_id'        => (int)$order['order_id'],
			'type'            => $order['type'],
			'reorder_id'      => (int)$order['reorder_id'],
			'order_status_id' => (int)$order['order_status_id'],
			'order_status'    => $order['order_status'],
			'customer'        => [
				'customer_id' => (int)$order['customer_id'],
				'firstname'   => $order['firstname'],
				'lastname'    => $order['lastname'],
				'email'       => $order['email'],
				'telephone'   => $order['telephone']
			],
			'payment'         => [
				'firstname' => $order['payment_firstname'],
				'lastname'  => $order['payment_lastname'],
				'company'   => $order['payment_company'],
				'address_1' => $order['payment_address_1'],
				'address_2' => $order['payment_address_2'],
				'city'      => $order['payment_city'],
				'postcode'  => $order['payment_postcode'],
				'zone'      => $order['payment_zone'],
				'country'   => $order['payment_country'],
				'method'    => $order['payment_method']
			],
			'shipping'        => [
				'firstname' => $order['shipping_firstname'],
				'lastname'  => $order['shipping_lastname'],
				'company'   => $order['shipping_company'],
				'address_1' => $order['shipping_address_1'],
				'address_2' => $order['shipping_address_2'],
				'city'      => $order['shipping_city'],
				'postcode'  => $order['shipping_postcode'],
				'zone'      => $order['shipping_zone'],
				'country'   => $order['shipping_country'],
				'method'    => $order['shipping_method']
			],
			'comment'         => $order['comment'],
			'products'        => $products,
			'totals'          => $totals,
			'total'           => (float)$order['total'],
			'currency_code'   => $order['currency_code'],
			'history'         => $history,
			'date_added'      => $order['date_added'],
			'date_modified'   => $order['date_modified']
		];
	}

	/**
	 * JSON body if present and valid, otherwise fall back to normal form POST.
	 * Reads php://input directly rather than $this->request->post so nested
	 * arrays (products[], customer{}) don't have to survive Request::clean()'s
	 * htmlspecialchars pass.
	 */
	private function body(): array {
		$raw = file_get_contents('php://input');

		if ($raw !== false && $raw !== '') {
			$decoded = json_decode($raw, true);

			if (is_array($decoded)) {
				return $decoded;
			}
		}

		return $this->request->post;
	}

	private function text($value, int $max): string {
		$value = trim((string)$value);

		if (Helper\Utf8\strlen($value) > $max) {
			$value = Helper\Utf8\substr($value, 0, $max);
		}

		return $value;
	}

	/**
	 * Reject the request unless it carries a valid bearer token.
	 * Copied verbatim from catalog/controller/agentapi/product.php - do not
	 * modify the auth logic here independently of that copy.
	 */
	private function authenticate(): void {
		if (!defined('AGENT_API_TOKEN') || AGENT_API_TOKEN === '') {
			$this->fail('not_configured', 'AGENT_API_TOKEN is not set.', 500);
		}

		if (!hash_equals(AGENT_API_TOKEN, $this->bearerToken())) {
			// Deliberately does not distinguish a missing token from a wrong one
			$this->fail('unauthorized', 'A valid bearer token is required.', 401);
		}
	}

	/**
	 * Read $_SERVER directly - Request::clean() runs htmlspecialchars() over it
	 * and would corrupt a token containing & < > ".
	 */
	private function bearerToken(): string {
		$header = '';

		if (!empty($_SERVER['HTTP_AUTHORIZATION'])) {
			$header = (string)$_SERVER['HTTP_AUTHORIZATION'];
		} elseif (!empty($_SERVER['REDIRECT_HTTP_AUTHORIZATION'])) {
			$header = (string)$_SERVER['REDIRECT_HTTP_AUTHORIZATION'];
		} elseif (function_exists('apache_request_headers')) {
			foreach (apache_request_headers() as $key => $value) {
				if (strtolower($key) == 'authorization') {
					$header = (string)$value;

					break;
				}
			}
		}

		$header = trim($header);

		if (stripos($header, 'bearer ') === 0) {
			return trim(substr($header, 7));
		}

		return '';
	}

	/**
	 * Emit JSON and stop. Order data is never cached (PII, mutable), unlike the
	 * product feed.
	 */
	private function respond(array $payload, int $status = 200): void {
		if (!headers_sent()) {
			http_response_code($status);
			header('Content-Type: application/json; charset=utf-8');
			header('Cache-Control: no-store', true);
			header('Access-Control-Allow-Origin: *');
		}

		echo json_encode($payload, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);

		exit;
	}

	private function fail(string $code, string $message, int $status): void {
		$this->respond(['success' => false, 'error' => ['code' => $code, 'message' => $message]], $status);
	}
}
