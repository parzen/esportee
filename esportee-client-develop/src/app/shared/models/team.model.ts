export class Team {
  id: number;
  name: string;
  teammembers: Teammember[]
}

export class Teammember {
  id: number;
  user: {id: number, username: string};
  joinDate: Date[];
  quitDate: Date[];
}