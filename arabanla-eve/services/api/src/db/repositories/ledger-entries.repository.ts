import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { LedgerEntry, AccountType } from "../entities/ledger-entry.entity";

@Injectable()
export class LedgerEntriesRepository {
  constructor(
    @InjectRepository(LedgerEntry)
    private readonly repo: Repository<LedgerEntry>,
  ) {}

  async findByTripId(tripId: string): Promise<LedgerEntry[]> {
    return this.repo.find({
      where: { tripId },
      order: { createdAt: "ASC" },
    });
  }

  async create(data: {
    tripId: string | null;
    account: AccountType;
    amountKurus: number;
  }): Promise<LedgerEntry> {
    const entry = this.repo.create(data);
    return this.repo.save(entry);
  }
}

