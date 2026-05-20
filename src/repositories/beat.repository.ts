import BaseRepository from "./base.repository";
import Beat from "../models/beat.model";

class BeatRepository extends BaseRepository<any> {
  constructor() {
    super(Beat);
  }
}

export default new BeatRepository();