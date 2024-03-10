'use server';

import { sql } from '@vercel/postgres';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';

const FormSchema = z.object({
  id: z.string(),
  customerId: z.string(),
  amount: z.coerce.number(),
  status: z.enum(['pending', 'paid']),
  date: z.string(),
});

const CreateInvoice = FormSchema.omit({
  id: true,
  date: true,
});

const UpdateInvoice = FormSchema.omit({
  id: true,
  date: true,
});

export async function createInvoice(formData: FormData) {
  // const rawFormData = {
  //   customerId: formData.get('customerId'),
  //   amount: formData.get('amount'),
  //   status: formData.get('status'),
  // };
  // console.log(rawFormData);

  const { amount, customerId, status } = CreateInvoice.parse({
    amount: formData.get('amount'),
    customerId: formData.get('customerId'),
    status: formData.get('status'),
  });
  const amountInCents = amount * 100;
  const date = new Date().toISOString().split('T')[0];

  await sql`
    INSERT INTO
      invoices (customer_id, amount, status, date)
    VALUES
      (${customerId}, ${amountInCents}, ${status}, ${date})
  `;

  const invoicesRoute = '/dashboard/invoices';
  revalidatePath(invoicesRoute);
  redirect(invoicesRoute);
}

export async function updateInvoice(id: string, formData: FormData) {
  const { amount, customerId, status } = UpdateInvoice.parse({
    amount: formData.get('amount'),
    customerId: formData.get('customerId'),
    status: formData.get('status'),
  });
  const amountInCents = amount * 100;
  const date = new Date().toISOString().split('T')[0];

  await sql`
    UPDATE invoices
    SET
      amount = ${amountInCents},
      customer_id = ${customerId},
      status = ${status}
    WHERE
      id = ${id}
  `;

  const invoicesRoute = '/dashboard/invoices';
  revalidatePath(invoicesRoute);
  redirect(invoicesRoute);
}

export async function deleteInvoice(id: string) {
  await sql`
    DELETE FROM
      invoices
    WHERE
      id = ${id}
  `;

  const invoicesRoute = '/dashboard/invoices';
  revalidatePath(invoicesRoute);
}
