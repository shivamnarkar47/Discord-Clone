const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="h-full bg-gray-200 flex flex-col items-center justify-center">
      {children}
    </div>
  );
};

export default AuthLayout;
