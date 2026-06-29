// File: src/compliance/uscis_validator.ts
import { z } from 'zod';

// Define the absolute formatting standards for Makeup-Street HR files
export const UscisComplianceSchema = z.object({
  // Enforces exact match for the employer entity string
  petitionerName: z.literal('Makeup-Street', {
    errorMap: () => ({ message: "Employer name must be exactly 'Makeup-Street'." })
  }),
  
  // Validates the standard 13-character USCIS receipt string
  receiptNumber: z.string().regex(/^[A-Z]{3}-\d{2}-\d{3}-\d{5}$/, {
    message: "Invalid Receipt Number. Must follow standard USCIS formatting (e.g., SRC-26-123-45678)."
  }),
  
  // Categorizes the approved worker visa types
  visaCategory: z.enum(['H-1B', 'O-1A'], {
    errorMap: () => ({ message: "Classification category must be either H-1B or O-1A." })
  }),
  
  // Aligns the tracking number to standard alphanumeric passport lengths
  passportNumber: z.string().min(6).max(12).toUpperCase().regex(/^[A-Z0-9]+$/, {
    message: "Passport number must be alphanumeric only."
  }),
  
  // Confirms the electronic arrival record is an exact 11-digit sequence
  i94AdmissionNumber: z.string().length(11).regex(/^\d+$/, {
    message: "I-94 record must consist of exactly 11 numeric digits."
  }),
  
  // Enforces valid calendar dates for the active status period
  validityStart: z.date(),
  validityEnd: z.date()
}).refine((data) => data.validityEnd > data.validityStart, {
  message: "Validity end date must occur after the start date.",
  path: ["validityEnd"]
});

export type UscisProfile = z.infer<typeof UscisComplianceSchema>;

/**
 * Validates a staff member's paperwork fields against standard USCIS rules.
 * @param profileData - The raw inputs extracted from documents.
 */
export function verifyDocumentLinkage(profileData: unknown) {
  const parseResult = UscisComplianceSchema.safeParse(profileData);
  
  if (!parseResult.success) {
    return {
      isValid: false,
      errors: parseResult.error.flatten().fieldErrors
    };
  }
  
  return {
    isValid: true,
    validatedData: parseResult.data
  };
}
