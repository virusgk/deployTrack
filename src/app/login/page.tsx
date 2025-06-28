'use client';
import { useActionState } from 'react';
import Link from 'next/link';
import { login } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { KeyRound, Loader2, AlertCircle, Rocket } from 'lucide-react';
import { useFormStatus } from 'react-dom';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';


function LoginButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" className="w-full" disabled={pending}>
            {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <KeyRound className="mr-2 h-4 w-4" />}
            Login
        </Button>
    );
}

export default function LoginPage() {
  const [state, formAction] = useActionState(login, undefined);

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-15rem)]">
      <Card className="w-full max-w-sm">
        <CardHeader className="items-center text-center">
            <Link href="/" className="flex items-center gap-2.5 mb-4">
                <Rocket className="w-8 h-8 text-primary" />
                <span className="text-2xl font-bold tracking-tight">
                DeployTrack
                </span>
            </Link>
          <CardTitle className="text-2xl">Admin Login</CardTitle>
          <CardDescription>
            Enter the administrator password to access the admin dashboard.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" type="password" required />
            </div>
            {state?.error && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Login Failed</AlertTitle>
                    <AlertDescription>
                        {state.error}
                    </AlertDescription>
                </Alert>
            )}
            <LoginButton />
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
