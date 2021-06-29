import {Team, Teammember} from '../models/team.model';

export class TeamUtils {
  static isTeamAdmin(team: Team, userId: number): boolean {
    let admin = TeamUtils.getAdmin(team);
    return admin != null && admin.user.id === userId;
  }

  static isActiveTeammember(teammember: Teammember): boolean {
    let lastJoinDate = TeamUtils.sortDatesDesc(teammember.joinDate)[0];
    let lastQuitDate = TeamUtils.sortDatesDesc(teammember.quitDate)[0];

    if (lastQuitDate) {
      if (lastQuitDate > lastJoinDate) {
        return false;
      }
    }
    return true;
  }

  static getActiveMembers(team: Team): Teammember[] {
    return team.teammembers.filter(teammember => TeamUtils.isActiveTeammember(teammember));
  }

  static getFormerMembers(team: Team): Teammember[] {
    return team.teammembers.filter(teammember => !TeamUtils.isActiveTeammember(teammember));
  }

  static getAdmin(team: Team): Teammember {
    let activeMembers = TeamUtils.getActiveMembers(team);
    if (activeMembers.length < 1) {
      console.log('Error: No active teammember in team!');
      return null;
    }

    let admin: Teammember = activeMembers[0];
    let adminLastJoinDate = TeamUtils.sortDatesDesc(admin.joinDate)[0];
    for (let teammember of activeMembers) {
      let thisLastJoinDate = TeamUtils.sortDatesDesc(teammember.joinDate)[0];
      if (thisLastJoinDate < adminLastJoinDate) {
        adminLastJoinDate = thisLastJoinDate;
        admin = teammember;
      }
    }
    return admin;
  }

  static sortDatesDesc(array: Date[]) {
    let date_sort_desc = function (date1, date2) {
      if (date1 > date2) {
        return -1;
      }
      if (date1 < date2) {
        return 1;
      }
      return 0;
    };
    return array.sort(date_sort_desc);
  }
}
