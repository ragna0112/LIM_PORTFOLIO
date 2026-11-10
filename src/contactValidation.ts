/* Control characters are intentionally rejected in untrusted form input. */
/* eslint-disable no-control-regex */
export const CONTACT_LIMITS={name:100,email:254,message:5000} as const;
export type ContactFields={name:string;email:string;message:string};
export type ContactErrors=Partial<Record<keyof ContactFields,string>>;
export function validateContact(fields:ContactFields):ContactErrors{
 const errors:ContactErrors={};
 if(!fields.name.trim()||fields.name.trim().length>100||/[\r\n\x00-\x1f\x7f]/.test(fields.name))errors.name='Enter your name (up to 100 characters).';
 if(fields.email.length>254||! /^[^\s<>@]+@[^\s<>@]+\.[^\s<>@]+$/.test(fields.email)||/[\x00-\x1f\x7f]/.test(fields.email))errors.email='Enter a valid email address.';
 if(!fields.message.trim()||fields.message.trim().length>5000||/[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/.test(fields.message))errors.message='Enter a message (up to 5,000 characters).';
 return errors;
}
