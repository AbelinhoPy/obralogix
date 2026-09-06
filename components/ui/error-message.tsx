import React from "react";

function ErrorMessage({ error }: { error: string | null }) {
  if (!error) return null;
  return (
    <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md text-sm my-4">
      {error}
    </div>
  );
}

export default ErrorMessage;