import { z } from 'zod';

/**
 * URL Validation Schemas using Zod
 */

export const urlSchema = z
  .string()
  .min(1, 'URL is required')
  .max(2048, 'URL is too long')
  .transform((val) => val.trim())
  .refine(
    (val) => {
      // Add https:// if missing
      if (!val.startsWith('http://') && !val.startsWith('https://')) {
        return `https://${val}`;
      }
      return val;
    },
    { message: 'Invalid URL format' }
  )
  .refine(
    (val) => {
      try {
        new URL(val.startsWith('http') ? val : `https://${val}`);
        return true;
      } catch {
        return false;
      }
    },
    { message: 'Please enter a valid URL (e.g., www.example.com)' }
  )
  .refine(
    (val) => {
      const urlPattern =
        /^(https?:\/\/)?[\w\-\.]+\.[a-zA-Z]{2,}(\/\S*)?$/;
      return urlPattern.test(val);
    },
    { message: 'Invalid URL format' }
  );

export const checkRequestSchema = z.object({
  url: urlSchema,
});

export type CheckRequestInput = z.infer<typeof checkRequestSchema>;

export const normalizedUrlSchema = z.string().url();

export type NormalizedUrl = z.infer<typeof normalizedUrlSchema>;
