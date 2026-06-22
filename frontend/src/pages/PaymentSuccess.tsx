import { CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const PaymentSuccess = () => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-[#e7e1ff]">
            <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md text-center">
                <CheckCircle size={48} className="mx-auto text-default-purple mb-4" />
                <h1 className="text-2xl font-bold text-default-purple mb-2">Payment Successful!</h1>
                <p className="text-default-gray mb-6">Thank you for your payment. You can now continue exploring.</p>
                <Link
                    to="/dashboard"
                    className="inline-block bg-default-purple hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-[20px] transition"
                >
                    Go to Dashboard
                </Link>
            </div>
        </div>
    );
};

export default PaymentSuccess;
