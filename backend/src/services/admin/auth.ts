import jwt from "jsonwebtoken";
import { config } from "dotenv";
import { IAuthService } from "../../interface/admin/Auth.service.interface";
import { IAuthRepository } from "../../interface/admin/Auth.repository.interface";
config();

export class AuthService implements IAuthService {
  private AuthRepository: IAuthRepository;

  constructor(AuthRepository: IAuthRepository) {
    this.AuthRepository = AuthRepository;
  }
  async login(AdminData: {
    email: string;
    password: string;
  }): Promise<
    { accessToken: string; refreshToken: string } | { error: string }
  > {
    try {
      const adminEmail = process.env.ADMIN_EMAIL;
      const adminPassword = process.env.ADMIN_PASSWORD;
      const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET;
      const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET;

      console.log(adminEmail, adminPassword, "env");

      if (
        !adminEmail ||
        !adminPassword ||
        !accessTokenSecret ||
        !refreshTokenSecret
      ) {
        throw new Error("Server configuration missing.");
      }

      console.log(AdminData.password, "body");

      // Compare the password directly, no hashing required
      if (
        AdminData.email !== adminEmail ||
        AdminData.password !== adminPassword
      ) {
        return { error: "Invalid email or password." };
      }

      const accessToken = jwt.sign(
        { email: AdminData.email, role: "admin" },
        accessTokenSecret,
        { expiresIn: "15m" }
      );

      const refreshToken = jwt.sign(
        { email: AdminData.email, role: "admin" },
        refreshTokenSecret,
        { expiresIn: "7d" }
      );

      return { accessToken, refreshToken };
    } catch (error: any) {
      console.error("Error during admin login:", error);
      return { error: "Internal server error. Please try again later." };
    }
  }

  async logout(refreshToken: string): Promise<any> {
    try {
      console.log("Logout process started...");
      return await this.AuthRepository.logout(refreshToken);
    } catch (error) {
      console.error("Logout error:", error);
      return { error: "Internal server error." };
    }
  }
  
  async getUser(): Promise<any> {
    try {
      const users = await this.AuthRepository.getAllUsers();
      if (!users) {
        return null;
      }
      return users;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  async getDoctor(): Promise<any> {
    try {
      const doctors = await this.AuthRepository.getAllDoctors();
      if (!doctors) {
        return null;
      }
      return doctors;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  async toggleUser(id: string): Promise<any> {
    try {
      const user = await this.AuthRepository.toggleUser(id);
      if (!user) {
        return null;
      }
      const message = user.isBlocked
        ? "User blocked successfully"
        : "User unblocked successfully";
      return { status: true, message };
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  async toggleDoctor(id: string): Promise<any> {
    try {
      const doctor = await this.AuthRepository.toggleDoctor(id);
      if (!doctor) {
        return null;
      }
      const message = doctor.isBlocked
        ? "Doctor blocked successfully"
        : "Doctor unblocked successfully";
      return { status: true, message };
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  async addService(name: string, isActive: boolean): Promise<any> {
    try {
      if (!name || name.trim() === "") {
        throw new Error("Service name cannot be empty.");
      }

      if (name.length > 12) {
        throw new Error("Service name cannot exceed 12 characters.");
      }

      const existingService = await this.AuthRepository.findServiceByName(name);
      if (existingService) {
        throw new Error("Service name already exists.");
      }

      const service = await this.AuthRepository.addService(name, isActive);
      if (!service) {
        throw new Error("Service not added.");
      }

      return { status: true, message: "Service added successfully", service };
    } catch (error: any) {
      console.error("Error in AuthService.addService:", error);
      throw new Error(
        error.message || "An error occurred while adding the service."
      );
    }
  }

  async editService(id: string, name: string, isActive: boolean): Promise<any> {
    try {
      const service = await this.AuthRepository.editService(id, name, isActive);
      if (!service) {
        throw new Error("Service not updated");
      }
      return { status: true, message: "Service updated successfully", service };
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  async toggleService(id: string): Promise<any> {
    try {
      const service = await this.AuthRepository.toggleService(id);
      if (!service) {
        throw new Error("Service not updated");
      }
      const message = service.isActive
        ? "Service enabled successfully"
        : "Service disabled successfully";
      return { status: true, message };
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  async getService(): Promise<any> {
    try {
      const services = await this.AuthRepository.getAllServices();
      if (!services) {
        return null;
      }
      return services;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  async getCertificates(id: string): Promise<any> {
    try {
      const certificates = await this.AuthRepository.getCertificates(id);
      return certificates;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  async approveDoctor(id: string): Promise<any> {
    try {
      const doctor = await this.AuthRepository.approveDoctor(id);
      if (!doctor) {
        throw new Error("Doctor not approved");
      }
      return { status: true, message: "Doctor approved successfully", doctor };
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  async rejectDoctor(id: string): Promise<any> {
    try {
      const doctor = await this.AuthRepository.rejectDoctor(id);
      if (!doctor) {
        throw new Error("Doctor not rejected");
      }
      return { status: true, message: "Doctor rejected successfully", doctor };
    } catch (error: any) {
      throw new Error(error.message);
    }
  }
}
