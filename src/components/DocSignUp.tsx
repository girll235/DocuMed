"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Formik, Form, FieldArray, FormikTouched, FormikErrors } from "formik"
import Image from "next/image"
import Link from "next/link"
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth"
import { collection, addDoc, updateDoc, doc, getDocs, setDoc } from "firebase/firestore"
import { auth, db } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { ROUTES, COLLECTIONS, USER_ROLES } from "@/lib/constants"
import { doctorSignUpSchema, initialValues, DoctorSignUpFormData } from "@/lib/validation/doctorSignUpSchema"
import { toast } from "react-hot-toast"
import { Specialty, Clinic } from "@/types"
import { Loader2, ArrowLeft, Plus, X } from "lucide-react"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const DocSignUp = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [specialtiesSnap, clinicsSnap] = await Promise.all([
          getDocs(collection(db, COLLECTIONS.SPECIALTIES)),
          getDocs(collection(db, COLLECTIONS.CLINICS))
        ]);

        setSpecialties(specialtiesSnap.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Specialty[]);

        setClinics(clinicsSnap.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Clinic[]);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load required data");
      }
    };
    fetchData();
  }, []);

  const handleSubmit = async (values: DoctorSignUpFormData) => {
    setIsLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        values.email,
        values.password
      );

      if (auth.currentUser) {
        await updateProfile(auth.currentUser, {
          displayName: `${values.displayName} ${values.surname}`
        });
        await setDoc(doc(db, COLLECTIONS.DOCTORS, userCredential.user.uid), {
          displayName: values.displayName,
          surname: values.surname,
          email: values.email,
          phoneNumber: values.phoneNumber,
          specialtyId: values.specialtyId,
          clinicId: values.clinicId,
          licenseNumber: values.licenseNumber,
          education: values.education,
          experience: values.experience,
          languages: values.languages,
          consultationFee: values.consultationFee,
          bio: values.bio,
          type: USER_ROLES.DOCTOR,
          verified: false,
          available: true,
          active: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          workingHours: {
            monday: { start: "09:00", end: "17:00" },
            tuesday: { start: "09:00", end: "17:00" },
            wednesday: { start: "09:00", end: "17:00" },
            thursday: { start: "09:00", end: "17:00" },
            friday: { start: "09:00", end: "17:00" }
          }
        });
        toast.success("Registration successful!");
        router.push(ROUTES.DOC_DASHBOARD);
      }
    } catch (error) {
      console.error("Error signing up:", error);
      toast.error(error instanceof Error ? error.message : "Registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="max-w-md mx-auto">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-between">
            <Link href={ROUTES.SIGNUP}>
              <Button variant="ghost" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
            </Link>
            <Image
              src="/logo.jpg"
              alt="DocuMed Logo"
              width={40}
              height={40}
              className="rounded-full"
            />
          </div>
          <CardTitle className="text-2xl font-bold text-center">
            Doctor Registration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Formik
            initialValues={initialValues}
            validationSchema={doctorSignUpSchema}
            onSubmit={handleSubmit}
          >
           {({ values, errors, touched, getFieldProps, setFieldValue }: {
  values: DoctorSignUpFormData;
  errors: FormikErrors<DoctorSignUpFormData>;
  touched: FormikTouched<DoctorSignUpFormData>;
  getFieldProps: any;
  setFieldValue: (field: string, value: any) => void;
}) => (
              <Form className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="displayName">First Name</Label>
                    <Input
                      id="displayName"
                      {...getFieldProps("displayName")}
                      className={errors.displayName && touched.displayName ? "border-red-500" : ""}
                    />
                    {errors.displayName && touched.displayName && (
                      <p className="text-red-500 text-sm mt-1">{errors.displayName}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="surname">Last Name</Label>
                    <Input
                      id="surname"
                      {...getFieldProps("surname")}
                      className={errors.surname && touched.surname ? "border-red-500" : ""}
                    />
                    {errors.surname && touched.surname && (
                      <p className="text-red-500 text-sm mt-1">{errors.surname}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="specialtyId">Specialty</Label>
                    <Select
                      onValueChange={(value) => setFieldValue("specialtyId", value)}
                      defaultValue={values.specialtyId}
                    >
                      <SelectTrigger className={errors.specialtyId && touched.specialtyId ? "border-red-500" : ""}>
                        <SelectValue placeholder="Select specialty" />
                      </SelectTrigger>
                      <SelectContent>
                        {specialties.map((specialty) => (
                          <SelectItem key={specialty.id} value={specialty.id}>
                            {specialty.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                      </Select>
                    {errors.specialtyId && touched.specialtyId && (
                      <p className="text-red-500 text-sm mt-1">{errors.specialtyId}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="clinicId">Clinic</Label>
                    <Select
                      onValueChange={(value) => setFieldValue("clinicId", value)}
                      defaultValue={values.clinicId}
                    >
                      <SelectTrigger className={errors.clinicId && touched.clinicId ? "border-red-500" : ""}>
                        <SelectValue placeholder="Select clinic" />
                      </SelectTrigger>
                      <SelectContent>
                        {clinics.map((clinic) => (
                          <SelectItem key={clinic.id} value={clinic.id}>
                            {clinic.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.clinicId && touched.clinicId && (
                      <p className="text-red-500 text-sm mt-1">{errors.clinicId}</p>
                    )}
                  </div>
                </div>

                <div>
                <Label htmlFor="licenseNumber">License Number</Label>
                  <Input
                    id="licenseNumber"
                    {...getFieldProps("licenseNumber")}
                    className={errors.licenseNumber && touched.licenseNumber ? "border-red-500" : ""}
                  />
                  {errors.licenseNumber && touched.licenseNumber && (
                    <p className="text-red-500 text-sm mt-1">{errors.licenseNumber}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    {...getFieldProps("bio")}
                    className={errors.bio && touched.bio ? "border-red-500" : ""}
                  />
                  {errors.bio && touched.bio && (
                    <p className="text-red-500 text-sm mt-1">{errors.bio}</p>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="experience">Years of Experience</Label>
                    <Input
                      id="experience"
                      type="number"
                      min="0"
                      {...getFieldProps("experience")}
                      className={errors.experience && touched.experience ? "border-red-500" : ""}
                    />
                    {errors.experience && touched.experience && (
                      <p className="text-red-500 text-sm mt-1">{errors.experience}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="consultationFee">Consultation Fee</Label>
                    <Input
                      id="consultationFee"
                      type="number"
                      min="0"
                      {...getFieldProps("consultationFee")}
                      className={errors.consultationFee && touched.consultationFee ? "border-red-500" : ""}
                    />
                    {errors.consultationFee && touched.consultationFee && (
                      <p className="text-red-500 text-sm mt-1">{errors.consultationFee}</p>
                    )}
                  </div>
                </div>
                // Add this after the consultation fee field in the form
<div>
  <Label>Education</Label>
  <FieldArray name="education">
    {({ push, remove }) => (
      <div className="space-y-4">
       {values.education.map((edu, index) => (
  <div key={index} className="space-y-2 p-4 border rounded-md">
            <div className="flex justify-between">
              <h4>Education #{index + 1}</h4>
              {index > 0 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => remove(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
      <div>
        <Label htmlFor={`education.${index}.degree`}>Degree</Label>
        <Input
          {...getFieldProps(`education.${index}.degree`)}
          className={
            (errors.education?.[index] as { degree?: string })?.degree && 
            touched.education?.[index]?.degree ? "border-red-500" : ""
          }
        />
      </div>
              <div>
                <Label htmlFor={`education.${index}.institution`}>Institution</Label>
                <Input
                  {...getFieldProps(`education.${index}.institution`)}
                  className={
                    (errors.education?.[index] as { institution?: string })?.institution && 
                    touched.education?.[index]?.institution ? "border-red-500" : ""
                  }
                />
              </div>
              <div>
                <Label htmlFor={`education.${index}.year`}>Year</Label>
                <Input
                  type="number"
                  min="1950"
                  max={new Date().getFullYear()}
                  {...getFieldProps(`education.${index}.year`)}
                  className={
                    (errors.education?.[index] as { year?: string })?.year && 
                    touched.education?.[index]?.year ? "border-red-500" : ""
                  }
                />
              </div>
            </div>
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          onClick={() => push({ degree: "", institution: "", year: new Date().getFullYear() })}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Education
        </Button>
      </div>
    )}
  </FieldArray>
</div>

// Update the languages FieldArray section
<div>
  <Label>Languages</Label>
  <FieldArray name="languages">
    {({ push, remove }) => (
      <div className="space-y-2">
        {values.languages.map((language, index) => (
          <div key={index} className="flex gap-2">
            <Input
              {...getFieldProps(`languages.${index}`)}
              placeholder="Enter language"
              className={
                errors.languages?.[index] && 
                Array.isArray(touched.languages) && 
                touched.languages[index] 
                  ? "border-red-500" 
                  : ""
              }
            />
            {index > 0 && (
              <Button
                type="button"
                variant="destructive"
                size="icon"
                onClick={() => remove(index)}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          onClick={() => push("")}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Language
        </Button>
      </div>
    )}
  </FieldArray>
</div>

<div>
  <Label htmlFor="email">Email</Label>
  <Input
    id="email"
    type="email"
    {...getFieldProps("email")}
    className={errors.email && touched.email ? "border-red-500" : ""}
  />
  {errors.email && touched.email && (
    <p className="text-red-500 text-sm mt-1">{errors.email}</p>
  )}
</div>

<div>
  <Label htmlFor="phoneNumber">Phone Number</Label>
  <Input
    id="phoneNumber"
    type="tel"
    {...getFieldProps("phoneNumber")}
    className={errors.phoneNumber && touched.phoneNumber ? "border-red-500" : ""}
  />
  {errors.phoneNumber && touched.phoneNumber && (
    <p className="text-red-500 text-sm mt-1">{errors.phoneNumber}</p>
  )}
</div>

<div>
  <Label htmlFor="password">Password</Label>
  <Input
    id="password"
    type="password"
    {...getFieldProps("password")}
    className={errors.password && touched.password ? "border-red-500" : ""}
  />
  {errors.password && touched.password && (
    <p className="text-red-500 text-sm mt-1">{errors.password}</p>
  )}
</div>

<div>
  <Label htmlFor="confirmPassword">Confirm Password</Label>
  <Input
    id="confirmPassword"
    type="password"
    {...getFieldProps("confirmPassword")}
    className={errors.confirmPassword && touched.confirmPassword ? "border-red-500" : ""}
  />
  {errors.confirmPassword && touched.confirmPassword && (
    <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>
  )}
</div>

                  <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Registering...
                    </>
                  ) : (
                    "Register"
                  )}
                </Button>
              </Form>
            )}
          </Formik>
        </CardContent>
      </Card>
    </div>
  );
};

export default DocSignUp;