// Removed unused import to avoid conflict
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export function usePermission(tipo: number) {
  const [isAllowed, setIsAllowed] = useState<boolean | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function checkPermission() {
      try {
        const response = await fetch(`http://127.0.0.1:5000/tem_permissao/${tipo}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });

        const responseData = await response.json();

        if (response.ok) {
            setIsAllowed(true);
        } else {
            setIsAllowed(false);
            if (responseData.verificacao === 1 || responseData.verificacao === 2 || responseData.verificacao === 3) {
                localStorage.removeItem("token");
                localStorage.removeItem("userId");
                navigate("/login");
            } else {
                navigate("/sem-permissao");
            }
        }
      } catch {
        setIsAllowed(false);
        navigate("/sem-permissao");
      }
    }

    checkPermission();
  }, [tipo, navigate]);

  return isAllowed;
}
