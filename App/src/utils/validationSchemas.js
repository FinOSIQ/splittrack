import * as yup from 'yup'

export const profileSchema = yup.object().shape({
    firstName: yup.string()
        .min(2, 'First name must be at least 2 characters')
        .required('First name is required'),
    
    lastName: yup.string()
        .min(2, 'Last name must be at least 2 characters')
        .required('Last name is required'),
    
    email: yup.string()
        .email('Invalid email format')
        .required('Email is required'),
    
    phoneNumber: yup.string()
        .matches(/^0\d{9}$/, "Phone number must be 10 digits and start with 0")
        .required("Phone number is required"),
    
    birthDate: yup.date()
        .max(new Date(), 'Birth date cannot be in the future')
        .required('Birth date is required'),
    
    currency: yup.string()
        .min(2, 'Currency must be at least 2 characters')
        .max(10, 'Currency must be less than 10 characters')
        .required('Currency is required')
})