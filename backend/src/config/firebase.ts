import admin from "firebase-admin";
import serviceAccount from "../../healio-270ae-firebase-adminsdk-fbsvc-888a9bf2b4.json";

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
});

export { admin };
