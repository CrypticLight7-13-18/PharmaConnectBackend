/**
 * Mongoose schema for Doctor documents.
 * Represents a doctor user in the application, including authentication, specialization, and availability.
 *
 * Fields:
 * - name: Doctor's name (required)
 * - email: Doctor's email address (unique, required, validated)
 * - role: User role, either 'doctor' or 'patient' (default: 'doctor')
 * - password: Hashed password (required, minimum length 8, not selected by default)
 * - passwordConfirm: Confirmation of password (required, must match password)
 * - specialization: Medical specialization (required, enumerated)
 * - appointmentIds: Array of references to Appointment documents
 * - consultationFee: Doctor's consultation fee
 * - experience: Years of experience
 * - location: Practice location (required)
 * - availability: Weekly schedule, with time slots for each day
 *
 * Includes pre-save middleware to hash the password and remove passwordConfirm,
 * and an instance method for password verification.
 *
 * @typedef {Object} Doctor
 * @property {string} name - The name of the doctor.
 * @property {string} email - The email address of the doctor.
 * @property {'patient' | 'doctor'} [role='doctor'] - The role of the user, either 'patient' or 'doctor'.
 * @property {string} password - The hashed password of the doctor.
 * @property {string} [passwordConfirm] - Password confirmation (not stored).
 * @property {string} specialization - Doctor's medical specialization.
 * @property {mongoose.ObjectId[]} appointmentIds - Array of Appointment references.
 * @property {number} [consultationFee] - Consultation fee amount.
 * @property {number} [experience] - Years of experience.
 * @property {string} location - Practice location.
 * @property {Object} availability - Weekly availability with time slots for each day.
 */
const doctorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please tell us your name!"],
  },
  email: {
    type: String,
    required: [true, "Please tell us your email address"],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, "Please enter a valid email address"],
  },
  role: {
    type: String,
    enum: ["patient", "doctor"],
    default: "doctor",
  },
  password: {
    type: String,
    required: [true, "Please provide a password!"],
    minlength: 8,
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, "Please confirm your password!"],
    validate: {
      validator: function (el) {
        return el === this.password;
      },
      message: "Passwords do not match",
    },
  },
  specialization: {
    type: String,
    required: [true, "Please provide a specialization."],
    enum: [
      "Cardiologist",
      "Neurologist",
      "Dermatologist",
      "Pediatrician",
      "Orthopedic",
      "Gynecologist",
      "Psychiatrist",
      "General Physician",
      "ENT Specialist",
      "Ophthalmologist",
    ],
  },
  appointmentIds: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Appointment",
    },
  ],
  consultationFee: {
    type: Number,
  },
  experience: {
    type: Number,
  },
  location: {
    type: String,
    required: [true, "Please provide your practice location"],
  },
  availability: {
    monday: [String],
    tuesday: [String],
    wednesday: [String],
    thursday: [String],
    friday: [String],
    saturday: [String],
    sunday: [String],
  },
});

/**
 * Pre-save middleware to hash the password before saving the doctor document.
 * Removes the passwordConfirm field from the document.
 * @param {Function} next - Callback function to pass control to the next middleware.
 */
doctorSchema.pre("save", async function (next) {
  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
  next();
});

/**
 * Instance method to verify if the provided password matches the stored hashed password.
 * @param {string} candidatePassword - The password provided by the user.
 * @param {string} userPassword - The stored hashed password.
 * @returns {Promise<boolean>} - Whether the passwords match.
 */
doctorSchema.methods.passwordVerification = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

const Doctor = mongoose.model("Doctor", doctorSchema);

export default Doctor;
