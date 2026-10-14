// DEMO DATA ONLY. Remove this file (and VITE_USE_MOCK_FALLBACK) once the real API is connected.
const IMG = (id, w) => 'https://images.unsplash.com/photo-' + id + '?auto=format&fit=crop&w=' + (w || 400) + '&q=80';
const P = {
    shruthi: '1544005313-94ddf0286df2', priya: '1534528741775-53994a69daeb', ananya: '1524504388940-b1c1722653e1',
    kavya: '1517841905240-472988babdf9', f5: '1531746020798-e6953c6e8e04', f6: '1438761681033-6461ffad8d80',
    m1: '1500648767791-00dcc994a43e', m2: '1535713875002-d1d0cf377fde', m3: '1507003211169-0a1dd7228f2d'
};
const base = { caste: 'Viswabrahmin', maritalStatus: 'Never Married', premium: false, online: false, membership: 'Free Member', motherTongue: 'Telugu', familyStatus: 'Middle Class', familyValues: 'Moderate' };
const make = (o) => Object.assign({}, base, o, { image: IMG(o.photo, 400), gallery: o.gallery.map((g) => IMG(g, 600)) });

export const MOCK_PROFILES = [
    make({
        id: 'MAT2087', name: 'Shruthi', fullName: 'Shruthi Reddy', gender: 'Female', age: 26, height: '5\'4"',
        occupation: 'Surgeon', education: 'MBBS, MS (Surgery)', income: '25 - 30 Lakhs', city: 'Hyderabad', state: 'Telangana',
        workLocation: 'Hyderabad, Telangana', nativePlace: 'Warangal, Telangana', weight: '55 kg', familyStatus: 'Upper Middle Class', familyValues: 'Traditional',
        premium: true, online: true, membership: 'Gold Member', diet: 'Pure Vegetarian', subCaste: 'Goldsmith (Achari)',
        familyType: 'Nuclear Family', fatherOccupation: 'Retired (Govt. Employee)', motherOccupation: 'Homemaker', siblings: '1 Brother (Unmarried)',
        about: 'I am a practicing surgeon based in Hyderabad, passionate about my work and committed to making a difference. I come from a traditional Viswabrahmin family but hold progressive views on life. I enjoy classical music, traveling to heritage sites, and spending quality time with my family. Looking for a compatible partner who values traditions and has a growth mindset.',
        rasi: 'Vrishabha (Taurus)', nakshatra: 'Rohini', padam: '2', dob: '15 March 2000', tob: '06:45 AM', pob: 'Warangal, Telangana',
        compatibility: { score: 28, total: 36, label: 'Excellent Match' },
        photo: P.shruthi, gallery: [P.shruthi, P.priya, P.ananya]
    }),
    make({
        id: 'MAT2091', name: 'Priya', fullName: 'Priya Chary', gender: 'Female', age: 24, height: '5\'3"',
        occupation: 'Software Engineer', education: 'B.Tech (CSE)', income: '12 - 15 Lakhs', city: 'Bangalore', state: 'Karnataka',
        workLocation: 'Bangalore, Karnataka', nativePlace: 'Guntur, Andhra Pradesh', weight: '52 kg', familyStatus: 'Middle Class', familyValues: 'Traditional',
        online: true, diet: 'Pure Vegetarian', subCaste: 'Carpenter (Vadla)', familyType: 'Joint Family',
        fatherOccupation: 'Business', motherOccupation: 'Homemaker', siblings: '1 Sister (Married)',
        about: 'Software engineer in Bangalore who loves problem solving, filter coffee and weekend treks. Family-oriented and looking for a kind, supportive partner.',
        rasi: 'Simha (Leo)', nakshatra: 'Magha', padam: '3', dob: '02 August 2002', tob: '09:10 PM', pob: 'Guntur, Andhra Pradesh',
        compatibility: { score: 25, total: 36, label: 'Good Match' },
        photo: P.priya, gallery: [P.priya, P.f5, P.f6]
    }),
    make({
        id: 'MAT2105', name: 'Ananya', fullName: 'Ananya Rao', gender: 'Female', age: 28, height: '5\'5"',
        occupation: 'Architect', education: 'B.Arch, M.Arch', income: '18 - 22 Lakhs', city: 'Chennai', state: 'Tamil Nadu',
        workLocation: 'Chennai, Tamil Nadu', nativePlace: 'Nellore, Andhra Pradesh', weight: '56 kg', familyStatus: 'Affluent', familyValues: 'Moderate',
        premium: true, membership: 'Gold Member', diet: 'Vegetarian', subCaste: 'Goldsmith (Achari)', familyType: 'Nuclear Family',
        fatherOccupation: 'Retired Professor', motherOccupation: 'Teacher', siblings: 'No Siblings',
        about: 'Architect who enjoys designing sustainable spaces, sketching and classical dance. Looking for a thoughtful partner with a good sense of humour.',
        rasi: 'Tula (Libra)', nakshatra: 'Swati', padam: '1', dob: '21 October 1998', tob: '04:30 AM', pob: 'Chennai, Tamil Nadu',
        compatibility: { score: 30, total: 36, label: 'Excellent Match' },
        photo: P.ananya, gallery: [P.ananya, P.shruthi, P.kavya]
    }),
    make({
        id: 'MAT2118', name: 'Kavya', fullName: 'Kavya Teja', gender: 'Female', age: 26, height: '5\'2"',
        occupation: 'Chartered Accountant', education: 'B.Com, CA', income: '14 - 18 Lakhs', city: 'Visakhapatnam', state: 'Andhra Pradesh',
        workLocation: 'Visakhapatnam, Andhra Pradesh', nativePlace: 'Rajahmundry, Andhra Pradesh', weight: '50 kg', familyStatus: 'Middle Class', familyValues: 'Traditional',
        online: true, diet: 'Pure Vegetarian', subCaste: 'Sculptor (Silpi)', familyType: 'Nuclear Family',
        fatherOccupation: 'Bank Manager (Retired)', motherOccupation: 'Homemaker', siblings: '1 Brother (Married)',
        about: 'Chartered accountant from Visakhapatnam. I love beach evenings, cooking traditional recipes and reading. Seeking a respectful and ambitious partner.',
        rasi: 'Kanya (Virgo)', nakshatra: 'Hasta', padam: '4', dob: '11 January 2000', tob: '11:55 AM', pob: 'Visakhapatnam, Andhra Pradesh',
        compatibility: { score: 26, total: 36, label: 'Good Match' },
        photo: P.kavya, gallery: [P.kavya, P.f6, P.priya]
    }),
    make({
        id: 'MAT2124', name: 'Karthik', fullName: 'Karthik Chary', gender: 'Male', age: 29, height: '5\'10"',
        occupation: 'Software Architect', education: 'B.Tech, M.S.', income: '35 - 40 Lakhs', city: 'Hyderabad', state: 'Telangana',
        workLocation: 'Hyderabad, Telangana', nativePlace: 'Khammam, Telangana', weight: '74 kg', familyStatus: 'Upper Middle Class', familyValues: 'Moderate',
        premium: true, online: true, membership: 'Gold Member', diet: 'Vegetarian', subCaste: 'Carpenter (Vadla)', familyType: 'Nuclear Family',
        fatherOccupation: 'Business', motherOccupation: 'Homemaker', siblings: '1 Sister (Unmarried)',
        about: 'Software architect based in Hyderabad. I enjoy cricket, travel and cooking on weekends. Looking for an educated, independent partner who values family.',
        rasi: 'Mesha (Aries)', nakshatra: 'Ashwini', padam: '2', dob: '07 June 1997', tob: '07:20 AM', pob: 'Hyderabad, Telangana',
        compatibility: { score: 27, total: 36, label: 'Good Match' },
        photo: P.m1, gallery: [P.m1, P.m2, P.m3]
    }),
    make({
        id: 'MAT2131', name: 'Sai Kiran', fullName: 'Sai Kiran Achari', gender: 'Male', age: 31, height: '5\'9"', maritalStatus: 'Divorced',
        occupation: 'Civil Engineer', education: 'B.E. (Civil)', income: '16 - 20 Lakhs', city: 'Vijayawada', state: 'Andhra Pradesh',
        workLocation: 'Vijayawada, Andhra Pradesh', nativePlace: 'Eluru, Andhra Pradesh', weight: '78 kg', familyStatus: 'Middle Class', familyValues: 'Traditional',
        diet: 'Non-Vegetarian', subCaste: 'Goldsmith (Achari)', familyType: 'Joint Family',
        fatherOccupation: 'Jeweller', motherOccupation: 'Homemaker', siblings: '2 Brothers (Married)',
        about: 'Civil engineer working on infrastructure projects. Calm, grounded and close to my family. Looking for an understanding partner for a fresh start.',
        rasi: 'Dhanu (Sagittarius)', nakshatra: 'Moola', padam: '1', dob: '19 December 1995', tob: '02:15 PM', pob: 'Vijayawada, Andhra Pradesh',
        compatibility: { score: 22, total: 36, label: 'Average Match' },
        photo: P.m2, gallery: [P.m2, P.m1, P.m3]
    })
];
