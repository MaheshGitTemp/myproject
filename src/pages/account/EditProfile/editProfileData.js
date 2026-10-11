export const HEIGHTS = ['5\'0"', '5\'4"', '5\'8"', '6\'0"'];
export const MARITAL = ['Never Married', 'Widowed', 'Divorced'];
export const GENDERS = ['Male', 'Female'];
export const RASI = ['Mesha', 'Simha', 'Tula'];
export const NAKSHATRA = ['Ashwini', 'Magha', 'Swati'];
export const PADAM = ['1', '2', '3', '4'];
export const EDUCATION = ['Bachelors', 'Masters', 'BTech', 'MBBS'];
export const OCCUPATION = ['Software Engineer', 'Doctor', 'Teacher', 'Business Owner'];

// Mock profile until the API exists. First/last name are overridden by the session user.
export const INITIAL_PROFILE = {
  firstName: 'Mahesh',
  lastName: 'Kumar',
  gender: 'Male',
  dob: '1995-05-15',
  height: '5\'8"',
  maritalStatus: 'Never Married',
  about: '',
  rasi: 'Simha',
  nakshatra: 'Magha',
  padam: '2',
  education: 'BTech',
  occupation: 'Software Engineer',
  income: '12 Lakhs',
  location: 'Hyderabad',
};
