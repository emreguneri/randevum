import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "../entities/user.entity";

@Injectable()
export class UsersRepository {
  constructor(
    @InjectRepository(User)
    private readonly repo: Repository<User>,
  ) {}

  async findById(id: string): Promise<User | null> {
    return this.repo.findOne({ where: { id } });
  }

  async findByPhone(phone: string): Promise<User | null> {
    return this.repo.findOne({ where: { phone } });
  }

  async create(phone: string): Promise<User> {
    const user = this.repo.create({ phone });
    return this.repo.save(user);
  }

  async findOrCreate(phone: string): Promise<User> {
    let user = await this.findByPhone(phone);
    if (!user) {
      user = await this.create(phone);
    }
    return user;
  }
}

