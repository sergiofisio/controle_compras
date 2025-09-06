// src/components/forms/CustomFormField.tsx
"use client";

import { Control } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/PasswordInput";

type FieldType = "email" | "password" | "text";

interface CustomFormFieldProps {
  control: Control<any>; 
  name: string;
  label: string;
  placeholder?: string;
  type?: FieldType;
}

export function CustomFormField({
  control,
  name,
  label,
  placeholder,
  type = "text",
}: CustomFormFieldProps) {
  
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            {type === "password" ? (
              <PasswordInput placeholder={placeholder} {...field} />
            ) : (
              <Input type={type} placeholder={placeholder} {...field} />
            )}
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}