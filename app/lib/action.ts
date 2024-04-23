'use server'

import { z } from 'zod';
import { sql } from '@vercel/postgres';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { error } from 'console';
import { signIn } from '@/auth';
import { AuthError } from 'next-auth';

//insert type errors inside zod

const FormSchema = z.object({
  id: z.string(),
  customerId: z.string({
    invalid_type_error: 'Please select a customer',
  }),
  amount: z.coerce
    .number()
    .gt(0, {
      message: 'Please insert an amount greater a $0.'
    }),
    status: z.enum(['pending', 'paid'], {
      invalid_type_error: 'Please select an invoice status'
    }),
    date: z.string(),
  });
  
  const CreateInvoice = FormSchema.omit({id:true, date: true});
  const UpdateInvoice = FormSchema.omit({ id: true, date: true });

  // you may want to consider using the entries() method with JS 
  // for example const rawFormData = Object.fromEntries(formData.entries())

  //config state for useFormState hook

  export async function authenticate(
    prevState: string | undefined,
    formData: FormData,
  ) {
    try {
      await signIn('credentials', formData);
    } catch (error) {
      if (error instanceof AuthError) {
        switch (error.type) {
          case 'CredentialsSignin':
            return 'Invalid credentials.';
          default:
            return 'Something went wrong.';
        }
      }
      throw error;
    }
  }

  export type State = {
    errors?: {
      customerId?: string[];
      amount?: string[];
      status?: string[];
    };
    message?: string | null;
  };
  
  export async function createInvoice(prevState: State, formdata: FormData) {
    const validatedFields = CreateInvoice.safeParse({
      customerId: formdata.get('customerId'),
      amount: formdata.get('amount'),
      status: formdata.get('status'),
        });
        console.log(validatedFields);
        // insert generic error message if missing fields
        if (!validatedFields.success) {
          return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Missing Fields. Failed to Create Invoice.',
          };
        }

        const { customerId, amount, status } = validatedFields.data;
        const amountInCents = amount * 100;
        const date = new Date().toISOString().split('T')[0]; // da approfondire
        //insert try/catch for handling database error
        try {
          await sql`
          INSERT INTO invoices (customer_id, amount, status, date)
          VALUES (${customerId}, ${amountInCents}, ${status}, ${date})
          `;
        } catch (error) {
          return {message: 'Database Error: Failed to create invoice'};
        }

        revalidatePath('/dashboard/invoices');
        redirect('/dashboard/invoices');
        
    //Chapter 12 
    // console.log(typeof rawFormData.amount);
}
// add prevState and general condition and errors
export async function updateInvoice(id: string, prevState: State, formData: FormData) {
    const validatedFields = UpdateInvoice.safeParse({
      customerId: formData.get('customerId'),
      amount: formData.get('amount'),
      status: formData.get('status'),
    });
   
    if (!validatedFields.success) {
      return {
        errors: validatedFields.error.flatten().fieldErrors,
        message: 'Missing Fields. Failed to Create Invoice.',
      };
    }
    // debouncing? the old const in the new const
    const { customerId, amount, status } = validatedFields.data;
    const amountInCents = amount * 100;
   
    try {
      await sql`
        UPDATE invoices
        SET customer_id = ${customerId}, amount = ${amountInCents}, status = ${status}
        WHERE id = ${id}
      `;
    } catch (error) {
      return {message: 'Database Error: Failed to update invoice'};
    }
   
    revalidatePath('/dashboard/invoices');
    redirect('/dashboard/invoices');
  }
  // maybe remove this? add a throw error idk why...
  export async function deleteInvoice(id: string) {
    try {
      await sql`DELETE FROM invoices WHERE id = ${id}`;
      revalidatePath('/dashboard/invoices');
      return {message: 'Deleted Invoice.'};
    } catch (error) {
      throw new Error('Failed to delete invoice');
      // return {message: 'Database Error: Failed to delete invoice.'};
    }
  }