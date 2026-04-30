import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { IconBuildingFactory2, IconBuildingHospital, IconShieldCheck } from "@tabler/icons-react";
import { useAuthStore } from "@/store/auth-store";
import { useAuth } from "@/hooks/auth";
import { Navigate, useNavigate } from "react-router";
import type React from "react";
import { useState } from "react";
import { toast } from "sonner";

// TODO: Think of loader Login Later
// export function LoginLoader() {
//   const { user } = useAuthStore(); // why not useAuth as it has react component like useeffect
//   const role = user.data.role
//
//   if (role) {
//     return redirect(`/${(role).toLowerCase()}`)
//   }
//   return null
//
// }

export default function LoginPage() {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const { setLogin } = useAuthStore();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (isAuthenticated) {
    const role = user.data.role;
    return <Navigate to={`/${role.toLowerCase()}`} />
  }

  const loginHandler = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    const formData = new FormData(e.currentTarget);
    // TODO: Use zod here schema vaildation 
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      const response = await fetch('http://localhost:4040/api/v1/users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // for cookie httpOnly
        body: JSON.stringify({
          email: email,
          password: password
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Invalid credentials");
      }

      const result = await response.json();

      setLogin(result.data.accessToken);

      navigate('/');

    } catch (error) {
      if (error instanceof Error) {
        console.log("Login request failed:" + error.message);
        toast.error(error.message);
        setErrorMessage(error.message);
      }
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
      {/* Left Side: Branding & Info (Hidden on Mobile) */}
      <div className="relative hidden flex-col justify-between bg-primary p-10 text-primary-foreground lg:flex">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.1),transparent)]" />

        <div className="relative z-10 flex items-center gap-2 text-2xl font-heading font-bold">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary-foreground text-primary">
            {/*<IconActivity className="h-6 w-6" />*/}
            <IconBuildingHospital className="h-6 w-6" />
          </div>
          STRAVIAM HMS
        </div>

        <div className="relative z-10">
          <blockquote className="space-y-2">
            <p className="text-lg font-medium leading-relaxed">
              "Precision in data, excellence in care. Our local-first system ensures
              hospital operations never skip a beat, even when the internet does."
            </p>
            <footer className="text-sm opacity-80">— Straviam Systems Engineering</footer>
          </blockquote>
        </div>

        {/* Feature Highlights */}
        <div className="relative z-10 grid grid-cols-2 gap-4 pt-8 border-t border-primary-foreground/20">
          <div className="flex items-center gap-2 text-sm">
            <IconShieldCheck className="h-4 w-4" />
            <span>Secure Patient Data</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <IconBuildingFactory2 className="h-4 w-4" />
            <span>Multi-System Management</span>
          </div>
        </div>
      </div>

      {/* Right Side: Login Form */}
      <div className="flex items-center justify-center p-8 bg-background">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[380px]">
          <div className="flex flex-col space-y-2 text-center lg:text-left">
            <h1 className="text-3xl font-heading font-bold tracking-tight">System Login</h1>
            <p className="text-sm text-muted-foreground">
              Enter your credentials to access the medical portal.
            </p>
          </div>

          <Card className="p-6 border-none shadow-none lg:border lg:shadow-sm">
            <form className="space-y-4" onSubmit={loginHandler}>
              <div className="space-y-2">
                <Label htmlFor="email">Work Email</Label>
                <Input
                  id="email"
                  type="email"
                  name="email"
                  placeholder="name@hospital.com"
                  className="bg-muted/30 focus-visible:ring-primary"
                  required
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <button type="button" className="text-xs text-primary hover:underline">
                    Forgot password?
                  </button>
                </div>
                <Input
                  id="password"
                  type="password"
                  name="password"
                  className="bg-muted/30 focus-visible:ring-primary"
                  required
                />
              </div>
              <Button type="submit"
                className="w-full font-semibold shadow-md"
                disabled={isLoading}
              >
                Sign In to Portal
              </Button>
            </form>
          </Card>

          <p className="px-8 text-center text-xs text-muted-foreground leading-relaxed">
            Authorized Personnel Only. Access attempts are logged under
            <span className="font-mono text-primary/80 block">STV_SEC_PROTOCOL</span>
          </p>
        </div>
      </div>
    </div>
  );
}
