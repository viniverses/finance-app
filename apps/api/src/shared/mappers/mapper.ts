export interface Mapper<FROM, TO> {
  toDTO(input: FROM): TO;
  toEntity?(input: TO): FROM;
}

