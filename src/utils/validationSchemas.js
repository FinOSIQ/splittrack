import * as yup from 'yup'

export const profileSchema = yup.object().shape({
    fullName: yup.string().required('Full name is required'),
    email: yup.string().email('Invalid email').required('Email is required'),
    phone: yup.string()
        .matches(/^0\d{9}$/, "Phone number must be 10 digits and start with 0")
        .required("Phone number is required"),

})