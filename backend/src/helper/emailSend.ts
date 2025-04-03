import sendMail from "../config/emailConfig";

export const emailSend = async (data: any) => {
  try {
    if (!data.patientId?.email || !data.doctorId?.email) {
      return null;
    }

    const appointmentDate = data.date ? new Date(data.date).toLocaleDateString() : "";
    const appointmentTime = data.time || "";
    const fees = typeof data.fees === "number" ? `₹${data.fees.toFixed(2)}` : "N/A";
    // Common CSS for both emails
    const commonStyles = `
      body {
        font-family: 'Helvetica Neue', Arial, sans-serif;
        background-color: #f5f7fa;
        margin: 0;
        padding: 0;
        color: #333333;
      }
      .container {
        max-width: 600px;
        margin: 20px auto;
        background-color: #ffffff;
        border-radius: 12px;
        overflow: hidden;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
      }
      .header {
        background-color: #dc2626; /* bg-red-600 */
        padding: 25px 20px;
        text-align: center;
      }
      .logo {
        color: white;
        font-size: 28px;
        font-weight: bold;
        letter-spacing: 1px;
        margin: 0;
      }
      .content {
        padding: 30px 25px;
      }
      h1 {
        color: #1e293b;
        font-size: 22px;
        margin-top: 0;
        margin-bottom: 20px;
        border-bottom: 1px solid #e5e7eb;
        padding-bottom: 10px;
      }
      p {
        color: #4b5563;
        line-height: 1.6;
        margin-bottom: 15px;
      }
      .details {
        width: 100%;
        border-collapse: separate;
        border-spacing: 0;
        margin: 25px 0;
        border-radius: 8px;
        overflow: hidden;
        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
      }
      .details th {
        background-color: #dc2626; /* bg-red-600 */
        color: white;
        font-weight: 600;
        text-align: left;
        padding: 12px 15px;
      }
      .details td {
        background-color: #dcfce7; /* bg-green-100 */
        padding: 12px 15px;
        border-bottom: 1px solid #ffffff;
      }
      .details tr:last-child td {
        border-bottom: none;
      }
      .details tr:hover td {
        background-color: #bbf7d0; /* Lighter green on hover */
        transition: background-color 0.2s ease;
      }
      .footer {
        background-color: #f8fafc;
        padding: 20px;
        text-align: center;
        font-size: 14px;
        color: #64748b;
        border-top: 1px solid #e5e7eb;
      }
      .button {
        display: inline-block;
        background-color: #dc2626;
        color: white;
        text-decoration: none;
        padding: 12px 25px;
        border-radius: 6px;
        font-weight: bold;
        margin-top: 15px;
        margin-bottom: 10px;
      }
      .button:hover {
        background-color: #b91c1c;
      }
    `;

    // Email body for the patient
    const patientBody = `
      <html>
        <head>
          <style>${commonStyles}</style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2 class="logo">HEALIO</h2>
            </div>
            <div class="content">
              <h1>Appointment Confirmation</h1>
              <p>Dear ${data.patientId.name},</p>
              <p>Your appointment has been successfully booked with Dr. ${data.doctorId.name}. Please find your appointment details below:</p>
              
              <table class="details">
                <tr>
                  <th colspan="2">Appointment Details</th>
                </tr>
                <tr>
                  <th>Appointment ID</th>
                  <td>${data.appointmentId}</td>
                </tr>
                <tr>
                  <th>Date</th>
                  <td>${appointmentDate}</td>
                </tr>
                <tr>
                  <th>Time</th>
                  <td>${appointmentTime}</td>
                </tr>
                <tr>
                  <th>Fees</th>
                  <td>${fees}</td>
                </tr>
                <tr>
                  <th>Status</th>
                  <td>${data.status}</td>
                </tr>
              </table>
              
              <p>If you have any questions or need to reschedule, please do not hesitate to contact us.</p>
              
              <div style="text-align: center;">
                <a href="#" class="button">Manage Appointment</a>
              </div>
            </div>
            <div class="footer">
              <p>Thank you for choosing HEALIO for your healthcare needs.</p>
              <p>© ${new Date().getFullYear()} HEALIO. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    // Email body for the doctor
    const doctorBody = `
      <html>
        <head>
          <style>${commonStyles}</style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2 class="logo">HEALIO</h2>
            </div>
            <div class="content">
              <h1>New Appointment Notification</h1>
              <p>Dear Dr. ${data.doctorId.name},</p>
              <p>You have received a new appointment booking. Please review the details below:</p>
              
              <table class="details">
                <tr>
                  <th colspan="2">Appointment Details</th>
                </tr>
                <tr>
                  <th>Appointment ID</th>
                  <td>${data.appointmentId}</td>
                </tr>
                <tr>
                  <th>Patient Name</th>
                  <td>${data.patientId.name}</td>
                </tr>
                <tr>
                  <th>Date</th>
                  <td>${appointmentDate}</td>
                </tr>
                <tr>
                  <th>Time</th>
                  <td>${appointmentTime}</td>
                </tr>
                <tr>
                  <th>Fees</th>
                  <td>${fees}</td>
                </tr>
                <tr>
                  <th>Status</th>
                  <td>${data.status}</td>
                </tr>
              </table>
              
              <p>Please prepare accordingly for the appointment.</p>
              
              <div style="text-align: center;">
                <a href="#" class="button">View Schedule</a>
              </div>
            </div>
            <div class="footer">
              <p>Thank you for being part of the HEALIO healthcare network.</p>
              <p>© ${new Date().getFullYear()} HEALIO. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    // Send emails
    await sendMail(data.patientId.email, "HEALIO: Your Appointment Confirmation", "", patientBody);
    await sendMail(data.doctorId.email, "HEALIO: New Appointment Notification", "", doctorBody);
  } catch (error: any) {
    console.log(error.message);
  }
};