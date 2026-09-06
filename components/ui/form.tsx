"use client";

import * as React from "react";

export function Form({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

export function FormField({ render }: any) {
  return render({ field: {} });
}

export function FormItem({ children }: { children: React.ReactNode }) {
  return <div>{children}</div>;
}

export function FormLabel({ children }: { children: React.ReactNode }) {
  return <label>{children}</label>;
}

export function FormControl({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

export function FormDescription({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-gray-500">{children}</p>;
}

export function FormMessage() {
  return null;
}