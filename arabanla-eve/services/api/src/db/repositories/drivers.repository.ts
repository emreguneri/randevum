import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Driver, DriverStatus } from "../entities/driver.entity";

@Injectable()
export class DriversRepository {
  constructor(
    @InjectRepository(Driver)
    private readonly repo: Repository<Driver>,
  ) {}

  async findById(id: string): Promise<Driver | null> {
    return this.repo.findOne({
      where: { id },
      relations: ["user", "presence"],
    });
  }

  async findByUserId(userId: string): Promise<Driver | null> {
    return this.repo.findOne({
      where: { userId },
      relations: ["user", "presence"],
    });
  }

  async create(userId: string, status: DriverStatus = "PENDING"): Promise<Driver> {
    const driver = this.repo.create({ userId, status });
    return this.repo.save(driver);
  }

  async updateStatus(id: string, status: DriverStatus): Promise<void> {
    await this.repo.update({ id }, { status });
  }

  async updateSubmerchantKey(id: string, submerchantKey: string): Promise<void> {
    await this.repo.update({ id }, { submerchantKey });
  }
}

