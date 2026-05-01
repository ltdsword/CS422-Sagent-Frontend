import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Loader2, Sparkles, UserPlus } from "lucide-react";
import { useAuth } from "@/shared/hooks/useAuth";
import type { AxiosError } from "axios";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/shared/components/ui/alert";

export default function RegisterPage() {
  const navigate = useNavigate();
  const { isAuthenticated, register } = useAuth();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage("");

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);

    try {
      await register({ username, email, password });
      navigate("/");
    } catch (error) {
      const axiosError = error as AxiosError<Record<string, string[] | string>>;
      const responseData = axiosError.response?.data;
      if (responseData && typeof responseData === "object") {
        const firstEntry = Object.values(responseData)[0];
        if (Array.isArray(firstEntry) && firstEntry[0]) {
          setErrorMessage(String(firstEntry[0]));
        } else if (typeof firstEntry === "string") {
          setErrorMessage(firstEntry);
        } else {
          setErrorMessage("Registration failed. Please review your details and try again.");
        }
      } else {
        setErrorMessage("Registration failed. Please review your details and try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl items-center justify-center px-6 py-12">
        <div className="grid w-full items-center gap-10 lg:grid-cols-2">
          <section className="hidden lg:block">
            <div className="space-y-4">
              <p className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-sm text-blue-700">
                <Sparkles className="mr-2 h-4 w-4" />
                Sagent Research Assistant
              </p>
              <h1 className="text-4xl font-semibold tracking-tight text-slate-900">
                Create your account and start building research workspaces.
              </h1>
              <p className="max-w-md text-slate-600">
                Join Sagent to discover papers, organize your library, and collaborate with AI
                agents for synthesis and analysis.
              </p>
            </div>
          </section>

          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="space-y-2">
              <CardTitle className="text-2xl text-slate-900">Create account</CardTitle>
              <CardDescription>
                Enter your details to set up your Sagent account.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-5" onSubmit={handleSubmit}>
                {errorMessage ? (
                  <Alert variant="destructive">
                    <AlertTitle>Unable to register</AlertTitle>
                    <AlertDescription>{errorMessage}</AlertDescription>
                  </Alert>
                ) : null}

                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    type="text"
                    placeholder="Choose a username"
                    autoComplete="username"
                    value={username}
                    onChange={(event) => setUsername(event.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    autoComplete="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Create a password"
                    autoComplete="new-password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Confirm your password"
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    required
                  />
                </div>

                <Button className="w-full" type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    <>
                      <UserPlus className="h-4 w-4" />
                      Create account
                    </>
                  )}
                </Button>
              </form>

              <p className="mt-5 text-center text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link className="font-medium text-primary hover:underline" to="/login">
                  Sign in
                </Link>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}

