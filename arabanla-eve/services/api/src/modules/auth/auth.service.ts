import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { UsersRepository } from "../../db/repositories/users.repository";

// Mock OTP storage (in production, use Redis with TTL)
const otpStore = new Map<string, { code: string; expiresAt: number }>();

@Injectable()
export class AuthService {
  constructor(
    private readonly usersRepo: UsersRepository,
    private readonly jwtService: JwtService,
  ) {}

  async requestOtp(phone: string): Promise<{ success: boolean; message: string }> {
    // Normalize phone number (remove spaces, dashes)
    const normalizedPhone = phone.replace(/[\s-]/g, "");

    // Generate 6-digit OTP
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes

    // Store OTP
    otpStore.set(normalizedPhone, { code, expiresAt });

    // In production, send SMS here
    console.log(`[MOCK OTP] Phone: ${normalizedPhone}, Code: ${code}`);

    return {
      success: true,
      message: "OTP sent successfully",
    };
  }

  async verifyOtp(phone: string, code: string): Promise<{ token: string; userId: string }> {
    const normalizedPhone = phone.replace(/[\s-]/g, "");
    const stored = otpStore.get(normalizedPhone);

    if (!stored) {
      throw new UnauthorizedException("OTP not found or expired");
    }

    if (Date.now() > stored.expiresAt) {
      otpStore.delete(normalizedPhone);
      throw new UnauthorizedException("OTP expired");
    }

    if (stored.code !== code) {
      throw new UnauthorizedException("Invalid OTP");
    }

    // OTP verified, remove it
    otpStore.delete(normalizedPhone);

    // Find or create user
    const user = await this.usersRepo.findOrCreate(normalizedPhone);

    // Generate JWT token
    const token = this.jwtService.sign({
      sub: user.id,
      phone: user.phone,
    });

    return {
      token,
      userId: user.id,
    };
  }

  async validateUser(userId: string): Promise<{ id: string; phone: string } | null> {
    const user = await this.usersRepo.findById(userId);
    if (!user) {
      return null;
    }
    return {
      id: user.id,
      phone: user.phone,
    };
  }
}

