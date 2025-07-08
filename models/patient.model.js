/**
 * Mongoose schema for Patient documents.
 * Represents a patient user in the application, including authentication, profile details, and references to appointments, chats, and orders.
 *
 * Fields:
 * - name: Patient's name (required)
 * - email: Patient's email address (unique, required, validated)
 * - role: User role, either 'patient' or 'doctor' (default: 'patient')
 * - password: Hashed password (required, minimum length 8, not selected by default)
 * - passwordConfirm: Confirmation of password (required, must match password)
 * - dateOfBirth: Patient's date of birth (required)
 * - appointmentIds: Array of references to Appointment documents
 * - chatIds: Array of references to Chat documents
 * - orderIds: Array of references to Order documents
 *
 * Includes pre-save middleware to hash the password and remove passwordConfirm,
 * and an instance method for password verification.
 *
 * @typedef {Object} Patient
 * @property {string} name - The name of the patient.
 * @property {string} email - The email address of the patient.
 * @property {'patient' | 'doctor'} [role='patient'] - The role of the user, either 'patient' or 'doctor'.
 * @property {string} password - The hashed password of the patient.
 * @property {string} [passwordConfirm] - Password confirmation (not stored).
 * @property {Date} dateOfBirth - The date of birth of the patient.
 * @property {mongoose.ObjectId[]} appointmentIds - Array of Appointment references.
 * @property {mongoose.ObjectId[]} chatIds - Array of Chat references.
 * @property {mongoose.ObjectId[]} orderIds - Array of Order references.
 */
const patientSchema = new mongoose.Schema({
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
    default: "patient",
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
  dateOfBirth: {
    type: Date,
    required: [true, "Please provide your date of birth"],
  },
  appointmentIds: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Appointment",
    },
  ],
  chatIds: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chat",
    },
  ],
  orderIds: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
    },
  ],
});

/**
 * Pre-save middleware to hash the password before saving the patient document.
 * Removes the passwordConfirm field from the document.
 * @param {Function} next - Callback function to pass control to the next middleware.
 */
patientSchema.pre("save", async function (next) {
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
patientSchema.methods.passwordVerification = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

const Patient = mongoose.model("Patient", patientSchema);

export default Patient;
