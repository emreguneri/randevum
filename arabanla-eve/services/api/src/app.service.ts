export class AppService {
  health() {
    return { ok: true, service: "api" };
  }
}

