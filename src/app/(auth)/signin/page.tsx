"use client"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import Link from "next/link"
import { useEffect, useState } from "react"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"
import { SignupSchema } from "@/schemas/signupSchema"
import axios, { AxiosError } from 'axios';
import { ApiResponse } from "@/types/ApiResponse"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { signinSchema } from "@/schemas/signinSchema"
import { signIn } from "next-auth/react"


export default function SignInForm() {

  const { toast } = useToast();
  const router = useRouter();

  //zod validation
  const form = useForm<z.infer<typeof signinSchema>>({
    resolver: zodResolver (signinSchema),
    defaultValues: {
      identifier: '',
      password: ''
    }
  })

  const onSubmit = async (data: z.infer<typeof signinSchema>) => {
    const result = await signIn('credentials', {
      redirect: false,
      identifier : data.identifier,
      password : data.password
    })
    console.log(result);
    if (result?.error) {
      toast({
        title: "Login failed",
        description: "Incorrect username or password",
        variant: "destructive"
      })
    }else {
      toast({
        title: "Login Successful",
        description: "Welcome to the world of mystery message",
        variant: "default"
      })
    }

    if (result?.url) {
      router.push('/dashboard')
    }

  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-800">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
          <div className="text-center">
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-6">
            Join Mystery Message
          </h1>
          <p className="mb-4">Sign in to start your anonymous adventure</p>
          </div>
          <Form {...form}>
            <form  onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
              name="identifier"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email/username</FormLabel>
                  <FormControl>
                    <Input placeholder="email/username" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
        />
        <FormField
              name="password"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
        />
        <Button type="submit" >
              Signin
          </Button>
            </form>
          </Form>
          <div className="text-center mt-4">
          <p>
            Already a member?{' '}
            <Link href="/sign-in" className="text-blue-600 hover:text-blue-800">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

