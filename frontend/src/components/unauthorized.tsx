const Unauthorized = () => {
  return (
    <div className="text-center mt-10">
      <h1 className="text-3xl font-bold">Access Denied</h1>
      <p className="mt-2 text-gray-600">
        You do not have permission to view this page.
      </p>
    </div>
  );
};

export default Unauthorized;
