import {Injectable} from '@angular/core';
import {LoggerService} from '../shared/logging.service';

@Injectable()
export class TournamentCreatorService {

  constructor(public logger: LoggerService) {
  }

  createTournament(userInput: TournamentConfig) {
    let stageOrder = 0; // stage order over full tournament
    let teams = userInput.teams;

    // Create stages
    for (let i in userInput.stages) {
      let result;
      let stage = userInput.stages[i];

      this.logger.info("Create " + stage.stageType + "-tournament with args:");
      this.logger.info(stage.toString());

      switch (stage.stageType) {
        case 'group':
          // Create new group tournament
          result = this.createGroupTournament(stageOrder, stage.nrGroups, stage.nrParticipants, stage.legs, stage.nrLocations, teams);
          if (this.resultHasError(result, stage.stageType)) return result.error;
          break;
        case 'single-elimination':
          // Create new single-elimination tournament
          result = this.createSingleEliminationTournament(stageOrder, stage.nrParticipants, stage.legs, stage.nrLocations, teams);
          if (this.resultHasError(result, stage.stageType)) return result.error;
          break;
        case 'league':
        case 'swiss':
        case 'double_elimination':
        case 'group_bracket':
          this.logger.error("Error: StageType '" + stage.stageType + "' not implemented yet!");
          return 1;
        default:
          this.logger.error("Error: Unknown stageType '" + stage.stageType + "'!");
          return 1;
      }

      this.logger.info("match plan: ");
      this.logger.info(result.matches);
      // TODO: save result.matches in database

      // Prepare next stage
      stageOrder = result.stageOrder + 1;
    }
  }

  // Create group tournament
  createGroupTournament(stageOrder: number, nrGroups: number, nrParticipants: number, legs: number, nrLocations: number, teams: Team[]) {
    let result2;
    let result = {
      matches: [],
      stageOrder: stageOrder,
      error: null
    };
    let participants = [];

    // check input params
    result.error = this.validateTournamentArgs(nrGroups, nrParticipants, legs, nrLocations, teams);
    if (result.error.errorCount > 0) {
      return result;
    }

    // fill participants buffer
    participants = this.createParticipants(stageOrder, nrParticipants, teams);

    // match.stage
    var stage = {
      order: stageOrder,
      name: "Group phase",
      mode: "group",
      playercount: nrParticipants
    };

    // Start Algorithm
    var round = 0;
    this.logger.info("== Tournament plan for " + nrGroups + " groups, " + legs + " legs, " + nrLocations + " locations ==\n");
    for (let leg = 0; leg < legs; leg++) {
      this.logger.info("--- leg " + leg + " ---\n");

      // Create matches for leg
      result2 = this.createMatches(nrGroups, participants, leg);

      // Schedule matches, separate for each leg
      result2 = this.scheduleMatches(result2.matchArray, result2.groups, nrGroups, nrLocations, stage, leg, round);

      if (result2.errorCount !== 0) {
        this.logger.error("Error: scheduleMatches() aborts with error!\n");
        result.error = result2.errors;
        return result;
      }

      round = result2.round;
      round++;
      result.matches = result.matches.concat(result2.scheduledMatches);
    }

    this.logger.info('== finished ==\n');

    // return
    result.stageOrder = stageOrder;
    return result;
  }

  createSingleEliminationTournament(stageOrder: number, nrParticipants: number, legs: number, nrLocations: number, teams: Team[]) {
    var result2;
    var result = {
      matches: [],
      stageOrder: stageOrder,
      error: null
    };
    var participants = [];

    // check input params
    result.error = this.validateTournamentArgs(1, nrParticipants, legs, nrLocations, teams);
    if (result.error.errorCount > 0) {
      return result;
    }

    // fill participants buffer
    participants = this.createParticipants(stageOrder, nrParticipants, teams);

    // find next multiple of 2; maximal participants must be greather or equal to nrParticipants
    // z.B. wenn nrParticipants=6, dann braucht man 8-tel Finale => participantSlotsInStage=8
    //      es gibt also participantSlotsInStage/2 = 8/2 = 4 maximale Matches.
    //      Es setzen in der ersten Stage participantSlotsInStage-nrParticipants = 8-6 = 2 Matches aus,
    //      d.h. es gibt also nrMatchesInStage = participantSlotsInStage/2 - (participantSlotsInStage-nrParticipants) = 4-(8-6) = 2 Matches in aktueller Stage
    var participantSlotsInStage = 1;
    while (nrParticipants > participantSlotsInStage) {
      participantSlotsInStage *= 2;
    }
    var nrBrackets = Math.log(participantSlotsInStage) * Math.LOG2E;
    var nrMatchesInStage = legs * (participantSlotsInStage / 2 - (participantSlotsInStage - nrParticipants));
    var nrMatches = legs * (nrParticipants - 1) - (legs - 1);  // (legs - 1), because final is always only one game!

    var round = 0;
    this.logger.info("== Tournament plan for single-elimination, " + (participantSlotsInStage / 2) + "-th final, " + legs + " legs, " + nrLocations + " locations ==\n");
    // Start Algorithm
    for (var bracket = 0; bracket < nrBrackets; bracket++) {
      if (bracket > 0) stageOrder++;

      this.logger.info("--- bracket " + bracket + " ---\n");
      var nrGroups = participantSlotsInStage / 2;

      // match.stage is changing in each loop
      var stage = {
        order: stageOrder,
        name: nrGroups + "-th final",
        mode: "single_elimination",
        playercount: nrParticipants
      };

      // In last stage
      if (bracket === nrBrackets - 1) {
        legs = 1; // final game is always only one game!
      }

      for (var leg = 0; leg < legs; leg++) {
        // Create matches for leg
        result2 = this.createMatches(nrGroups, participants, leg);

        // Schedule matches, separate for each leg
        result2 = this.scheduleMatches(result2.matchArray, result2.groups, nrGroups, nrLocations, stage, leg, round);

        if (result2.errorCount !== 0) {
          this.logger.error("Error: scheduleMatches() aborts with error!\n");
          result.error = result2.errors;
          return result;
        }

        round = result2.round;
        round++;
        result.matches = result.matches.concat(result2.scheduledMatches);
      }

      participantSlotsInStage /= 2;
      nrParticipants = participantSlotsInStage;

      // After first stage, no participant can be set, so fill all following participants with empty objects
      participants = [];
      for (let i = 0; i < nrParticipants; i++) {
        var participant = this.createDummyParticipant("Empty" + i);
        participants.push(participant);
      }
    }

    // Sanity check
    if (result.matches.length > nrMatches) {
      this.logger.error("Error: Too many matches created! (result.matches.length > nrMatches: " + result.matches.length + " > " + nrMatches + ")\n");
      result.error.errorCount++;
    }

    this.logger.info('== finished ==\n');

    // return
    result.stageOrder = stageOrder;
    return result;
  }

  // Create participants
  createParticipants(stageOrder: number, nrParticipants, teams: Team[]): Participant[] {
    let participants = [];

    // If stageOrder === 0 means that this is the very first stage in the full tournament
    if (stageOrder === 0) {
      // Fill first participants with handed teams
      for (let team of teams) {
        var participant = new Participant(team, -1);
        participants.push(participant);
      }

      // Fill the rest of participants array with dummy elements
      for (let i = participants.length; i < nrParticipants; i++) {
        var participant = this.createEmptyParticipant("Participant" + i);
        participants.push(participant);
      }
    } else {
      // Not first stage -> All participants unknown -> fill with empty participants objects
      for (let i = 0; i < nrParticipants; i++) {
        var participant = this.createDummyParticipant("Empty" + i);
        participants.push(participant);
      }
    }

    return participants;
  }

  // Create an empty participant with db id
  createEmptyParticipant(name: string): Participant {
    // TODO: participant soll hier ein echtes leeres objekt aus db sein
    var participant = new Participant(new Team(name), -1);
    return participant;
  }

  // Create an empty participant object
  createDummyParticipant(name: string): Participant {
    // TODO: participant soll hier ein leeres objekt vom typ participant sein. Wird im Laufe des Turniers dann durch ein echtes DB-Participant ersetzt.
    var participant = {team: {name: name, users: "", organization: ""}, score: -1};
    return participant;
  }

  // Create matches
  createMatches(nrGroups, participants, leg) {
    var i;

    var nrParticipants = participants.length;
    //shuffle(participants); // TODO: shuffle participants

    // Save all entries in an array
    var matchArray = new Array(nrGroups);
    for (i = 0; i < nrGroups; i++) {
      matchArray[i] = [];
    }

    // Array containing all participants in a group
    // groups = [ A, B, C, D;
    //            E, F, G;
    //            H, I, J ];
    var groups = new Array(nrGroups);
    for (i = 0; i < nrGroups; i++) {
      groups[i] = [];
    }

    // Find all Matches
    var startGrpMember = 0;
    var nrGroupsLeft = nrGroups;
    this.logger.info("-- List of all matches --\n");
    for (let grp = 0; grp < nrGroups; grp++) {
      var matchArrayidx = 0;

      var nrMemberPerGroup = Math.ceil(nrParticipants / nrGroupsLeft); // auf integer aufrunden

      var grpMember = participants.slice(startGrpMember, startGrpMember + nrMemberPerGroup); // grpMember = [A B C D]
      groups[grp] = grpMember;
      startGrpMember += nrMemberPerGroup;
      nrGroupsLeft--;
      var nrGrpMember = grpMember.length;
      nrParticipants = nrParticipants - nrGrpMember;

      this.logger.info("-- Group " + grp + ": " + JSON.stringify(grpMember) + " --\n");

      var nrMatches = (nrGrpMember - 1) * (nrGrpMember) / 2;  // Gaußsche Summenformel: nrMatches = 6

      var p = 0;
      var q = 1;
      for (let j = 0; j < nrMatches; j++) {
        if (((j + leg) % 2) === 0) {  // j+leg == even
          this.logger.info(" " + grpMember[p].team.name + " vs " + grpMember[q].team.name + "\n");
          matchArray[grp][matchArrayidx] = [grpMember[p], grpMember[q]];  // TODO: add participaobject here and not participants name
          matchArrayidx++;

        } else {  // j+leg == uneven
          this.logger.info(" " + grpMember[q].team.name + " vs " + grpMember[p].team.name + "\n");
          matchArray[grp][matchArrayidx] = [grpMember[q], grpMember[p]];  // TODO: add participaobject here and not participants name
          matchArrayidx++;
        }

        if (q >= nrGrpMember - 1) {
          p++;
          q = p + 1;
        } else {
          q++;
        }
      }
      this.logger.info("\n");
    }
    return {
      matchArray: matchArray,
      groups: groups
    };
  }

  // Code um Matches in Runden und Location einzuteilen
  scheduleMatches(matchArray, groups, nrGroups, nrLocations, stage, leg, round) {
    let scheduledMatches = [];
    let result = {
      errorCount: 0,
      error: "",
      scheduledMatches: scheduledMatches,
      round: round
    };

    // get all matches in this leg and fill them groupwise in matchArray[grp]
    // i.e:
    //  matchArray[grp, {matches}] =
    //  [
    //  0, {{A, B}, {A, C}, {A, D}, {A, E}, {A, F}, {A, G}, {A, H}, {B, C}, {B, D}}
    //  1, {{I, J}, {I, K}, {I, L}, {I, M}}
    //  2, {{Q, R}, {Q, S}, {Q, T}, {R, S}, {R, T}, {S, T}}
    //  3, {{X, Y}}
    //  4, {{U, V}, {U, W}, {U, X}, {V, W}}
    //  ]
    //this.logger.info("matchArray: ");Logger.info(matchArray);

    // Array containing per group all participants
    // i.e.: grpArray[grp, {participants}] =  { [A,B,C], [D,E,F], [G,H] }
    // var grpArray = cell(nrGroups,1);
    let grpArray = new Array(nrGroups);
    for (let i = 0; i < nrGroups; i++) {
      grpArray[i] = groups[i];
    }
    // Logger.info("grpArray: ");Logger.info(grpArray);

    // Array indexing the starting team for the current round group wise
    // i.e.: startTeamArray[grp, startIndex] =  { 2, 2, 1 }
    // var startTeamArray = size(1,nrGroups);
    let startTeamArray = new Array(nrGroups);
    for (let i = 0; i < nrGroups; i++) {
      // choose last member, to start with first team
      startTeamArray[i] = grpArray[i].length - 1;
    }

    // Array indexing the next susp} team for the next round group wise
    // i.e.: suspendTeamArray[grp, startIndex] =  { 1, 1, 0 }
    let suspendTeamArray = new Array(nrGroups);
    for (let i = 0; i < nrGroups; i++) {
      // choose second last member as susp} team, to start with last one
      suspendTeamArray[i] = grpArray[i].length - 2;
    }

    // Holding parallel possible matches in each group (have to be
    // floor(nrMemberInGroup/2) matches after each match search)
    // i.e.: matchesInGroup[grp, {matches}] =
    //  [
    //  0, {{A, B}, {C, D}, {E, F}, {G, H}}
    //  1, {{I, J}, {K, L}, {M, N}, {O, P}}
    //  2, {{Q, R}, {S, T}}
    //  3, {}
    //  4, {{U,V}, {W,X}}
    //  ]
    let matchesInGroup = new Array(nrGroups);
    for (let i = 0; i < nrGroups; i++) {
      matchesInGroup[i] = [];
    }

    // Array holding all matches in current round
    let matchesInRound = [];
    let nrMatchesInRound = 0;

    let matchesPossible = nrLocations;
    let nextGrpStart = 0;
    while (1) {
      this.logger.info("- Round " + round + " -\n");

      // Empty matches in round
      matchesInRound = [];
      nrMatchesInRound = 0;

      // loop over groups
      let grpScanned = 0;
      let grp = nextGrpStart;
      // loop over all groups
      while (grpScanned < nrGroups) {
        let matchesSearched = 0;

        // Check if matches in grp left
        let nrMatchesLeft = matchArray[grp].length;
        if (nrMatchesLeft > 0) {
          // Get number of left matches in the group array
          var nrMatchesInGroup = 0;
          var lenMatchesInGroupArray = matchesInGroup[grp].length;
          for (let m = 0; m < lenMatchesInGroupArray; m++) {
            if (matchesInGroup[grp][m] !== null) {
              nrMatchesInGroup++;
            }
          }

          // If no matches in group left -> get next matches
          if (nrMatchesInGroup === 0) {
            var resultSm;
            result2 = this.searchMatches(grpArray,
              grp,
              matchArray,
              startTeamArray,
              suspendTeamArray,
              matchesInGroup,
              nrMatchesInGroup);

            // Update
            startTeamArray = result2.startTeamArray;
            suspendTeamArray = result2.suspendTeamArray;
            matchesInGroup = result2.matchesInGroup;
            nrMatchesInGroup = result2.nrMatchesInGroup;

            matchesSearched = 1;
          }

          // If matches in group left -> combine them with current round
          if (nrMatchesInGroup > 0) {
            var result2;
            result2 = this.addMatchesToRound(matchesInGroup,
              nrMatchesInGroup,
              matchesPossible,
              matchesInRound,
              nrMatchesInRound,
              matchArray,
              grp,
              nrLocations,
              round,
              leg,
              stage);

            let error = result2.error;
            if (error !== 0) {
              this.logger.error("Error: addMatchesToRound() aborts with error!\n");
              result.errorCount++;
              result.error = error;
              return result;
            }

            // Update
            matchesInGroup = result2.matchesInGroup;
            nrMatchesInGroup = result2.nrMatchesInGroup;
            matchesPossible = result2.matchesPossible;
            matchesInRound = result2.matchesInRound;
            nrMatchesInRound = result2.nrMatchesInRound;
            matchArray = result2.matchArray;
            scheduledMatches = scheduledMatches.concat(result2.scheduledMatchesForThisRound);
          }

          // if matchesPossible == 0 -> break group-loop;
          if (matchesPossible === 0) {
            break;
          }

          // If no matches were searched in this round and the nrMatchesInGroup
          // array is empty but still matches Possible, then search matches (jump
          // over grp-increment)
          if (matchesSearched === 0 && nrMatchesInGroup === 0 && matchesPossible > 0) {
            continue;
          }
        }

        if (grp + 1 >= nrGroups) {
          grp = 0;
        } else {
          grp++;
        }
        grpScanned++;
      } // loop over groups

      // Select next group start
      if (nrMatchesInGroup > 0 && matchesPossible === 0) {
        // If still matches in group, but no locations anymore, keep group for
        // next round and skip selecting next group
        nextGrpStart = grp;
      } else {
        // Take next group as group start
        if (nextGrpStart + 1 >= nrGroups) {
          nextGrpStart = 0;
        } else {
          nextGrpStart++;
        }
      }

      // Test if any matches not scheduled, if so -> break;
      let nrMatchesLeft = 0;
      for (let g = 0; g < nrGroups; g++) {
        nrMatchesLeft += matchArray[g].length;
      }

      if (nrMatchesLeft === 0) {
        // finish
        break;
      }

      // sanity check
      if (matchesPossible > 0 && nrMatchesInRound === 0) {
        this.logger.error("Error: No matches in round " + round + ", this should not happen!!\n");
        result.errorCount++;
        result.error = "internal_server_error"
        return result;
      }

      // sanity check
      if (matchesPossible > 0) {
        // this.logger.info("Warning: %d empty location(s) during round! Perhaps not optimal scheduled!\n",matchesPossible);
      }

      matchesPossible = nrLocations;
      round++;
    }

    //TODO: woher kommt error? result.error = error;
    result.scheduledMatches = scheduledMatches;
    result.round = round;
    return result;
  }

  searchMatches(grpArray, grp, matchArray, startTeamArray, suspendTeamArray, matchesInGroup, nrMatchesInGroup) {
    var nrMemberInGroup = grpArray[grp].length;

    // Select suspend team, this have to be done if all others have played once;
    // otherwise, the team stays as suspend team
    if (suspendTeamArray[grp] + 1 >= nrMemberInGroup) {
      suspendTeamArray[grp] = 0;
    } else {
      suspendTeamArray[grp]++;
    }

    var group = grpArray[grp];

    // try different start teams, if not enough matches found
    var startTeamsTried = 0;
    while (startTeamsTried < nrMemberInGroup) {
      // Select starting team
      nrMemberInGroup = grpArray[grp].length;
      if (startTeamArray[grp] + 1 >= nrMemberInGroup) {
        startTeamArray[grp] = 0;
      } else {
        startTeamArray[grp]++;
      }

      // Select start team
      var startTeam = group[startTeamArray[grp]];

      // If number of members is uneven, always one have to suspend
      var suspendTeam;
      if ((nrMemberInGroup % 2) !== 0) { // uneven
        suspendTeam = group[suspendTeamArray[grp]];
      } else {
        suspendTeam = [];
      }

      // this.logger.info("Start team %s | Suspend team %s\n",startTeam,suspendTeam);

      // If start team is suspend team -> try next start team
      if (startTeam !== suspendTeam) {
        // search first Match where startTeam participates
        var lenMatchesArray = matchArray[grp].length;
        var m;
        for (m = 0; m < lenMatchesArray; m++) {
          // Take match from matchArray[grp]
          var newMatch = matchArray[grp][m];
          var newTeamHome = newMatch[0];
          var newTeamAway = newMatch[1];

          // Search if match has startTeam and not suspendTeam
          if (((startTeam == newTeamHome) ||
            (startTeam == newTeamAway))
            &&
            ((suspendTeam !== newTeamHome) &&
            (suspendTeam !== newTeamAway))) {
            // this.logger.info("Start team %s is in match (%s vs %s)\n",startTeam,newMatch[0],newMatch[1]);
            break;
          } else {
            // this.logger.info("Start team %s is not in match (%s vs %s)\n",startTeam,newMatch[0],newMatch[1]);
          }
        }

        var matchesScanned = 0;
        nrMatchesInGroup = 0;
        while (matchesScanned < lenMatchesArray) {
          // Take match from matchArray[grp]
          var newMatch = matchArray[grp][m];
          var newTeamHome = newMatch[0];
          var newTeamAway = newMatch[1];
          var addMatch = 0;

          if (nrMatchesInGroup === 0) {
            // If no matches in round yet
            if ((newTeamHome !== suspendTeam) &&
              (newTeamAway !== suspendTeam)) {
              addMatch = 1;
            }
          } else {
            // Test if teams from newMatch are already busy in this round
            var lenMatchesInGroupArray = matchesInGroup[grp].length;
            addMatch = 1;
            for (let t = 0; t < lenMatchesInGroupArray; t++) {
              var match = matchesInGroup[grp][t];

              // Array slots can be empty, because they are just nulled
              if (match === null) {
                if ((newTeamHome == suspendTeam) ||
                  (newTeamAway == suspendTeam)) {
                  addMatch = 0;
                  break;
                } else {
                  addMatch = 1;
                  continue;
                }
              }

              var teamHome = match[0]; // A
              var teamAway = match[1]; // C
              if ((newTeamHome == teamHome) ||
                (newTeamHome == teamAway) ||
                (newTeamAway == teamHome) ||
                (newTeamAway == teamAway)) {
                // At least one team is busy, try next newMatch
                // this.logger.info("One team is busy (%s vs %s)\n",newMatch[0],newMatch[1]);
                addMatch = 0;
                break;
              } else if ((newTeamHome == suspendTeam) ||
                (newTeamAway == suspendTeam)) {
                // One team is a suspendTeam
                // this.logger.info("One team is the suspend team %s (%s vs %s)\n",suspendTeam,newMatch[0],newMatch[1]);
                addMatch = 0;
                break;
              } else {
                // Both teams are free in this round
                // this.logger.info("Both teams are free (%s vs %s)\n",newMatch[0],newMatch[1]);
                addMatch = 1;
              }
            }
          }

          // add newMatch in this round
          if (addMatch === 1) {
            // Add newMatch in match array
            matchesInGroup[grp].push(newMatch);
            nrMatchesInGroup++;
            // this.logger.info("Added match: %s vs %s\n",newMatch[0],newMatch[1]);
          }

          matchesScanned++;

          if (m + 1 >= lenMatchesArray) {
            m = 0;
          } else {
            m++;
          }
        }    // loop over matches in group grp
      }

      // if not enough matches found (it have to be floor(nrMemberInGroup/2)
      // matches) -> retry with next team start
      var nrMatchesNeeded = Math.floor(nrMemberInGroup / 2);
      if (nrMatchesInGroup < nrMatchesNeeded) {
        // this.logger.info("Not enough matches found (%d < %d), try next Team start\n",nrMatchesInGroup,nrMatchesNeeded);

        // Remove all matches from array
        var lenMatchesInGroupArray = matchesInGroup[grp].length;
        matchesInGroup[grp] = [];
        nrMatchesInGroup -= lenMatchesInGroupArray;

        if (nrMatchesInGroup !== 0) {
          this.logger.error("Error: Not all matches deleted, this should not happen!!\n");
        }
      } else {
        break;
      }

      startTeamsTried++;
    }

    // return
    return {
      startTeamArray: startTeamArray,
      suspendTeamArray: suspendTeamArray,
      matchesInGroup: matchesInGroup,
      nrMatchesInGroup: nrMatchesInGroup
    };
  }

  addMatchesToRound(matchesInGroup, nrMatchesInGroup, matchesPossible, matchesInRound, nrMatchesInRound, matchArray, grp, nrLocations, round, leg, stage) {
    var scheduledMatchesForThisRound = [];
    var result = {
      error: null,
      errorCount: 0,
      matchesInGroup: matchesInGroup,
      nrMatchesInGroup: nrMatchesInGroup,
      matchesPossible: matchesPossible,
      matchesInRound: matchesInRound,
      nrMatchesInRound: nrMatchesInRound,
      matchArray: matchArray,
      scheduledMatchesForThisRound: scheduledMatchesForThisRound
    };

    // There are matches in the array left
    var lenMatchesInGroupArray = matchesInGroup[grp].length;
    for (let m = 0; m < lenMatchesInGroupArray; m++) {
      // Test if enough locations are left for this round
      if (matchesPossible === 0 || nrMatchesInGroup === 0) {
        break;
      }

      // Get match from match array
      var newMatch = matchesInGroup[grp][m];

      // Die Elemente werden auf NULL gesetzt, deshalb hier ein test ob
      // nicht leer
      if (newMatch == null) {
        continue;
      }

      // Test if newMatch is already present in round; this can happen
      // when first the matchesInGroup had some matches left and enough
      // locations were possible, so a new search was conducted
      var teamAlreadyPresentInRound = 0;
      for (let q = 0; q < nrMatchesInRound; q++) {
        var match = matchesInRound[q];
        if (match == null) {
          continue;
        }

        var newTeamHome = newMatch[0];
        var newTeamAway = newMatch[1];
        var teamHome = match[0];
        var teamAway = match[1];
        if ((newTeamHome == teamHome) ||
          (newTeamHome == teamAway) ||
          (newTeamAway == teamHome) ||
          (newTeamAway == teamAway)) {
          teamAlreadyPresentInRound = 1;
          break;
        }
      }

      if (teamAlreadyPresentInRound == 1) {
        // If one team already present in round, try next match
        continue;
      }

      // Find newMatch in matchArray
      var beforeNrMatchesInGroupLeft = nrMatchesInGroup;
      var lenMatchesArray = matchArray[grp].length;
      for (let q = 0; q < lenMatchesArray; q++) {
        var match = matchArray[grp][q];
        if (match == null) {
          continue;
        }

        if (match[0] == newMatch[0] &&
          match[1] == newMatch[1]) {
          // remove newMatch from matchArray and matchesInGroup
          matchArray[grp].splice(q, 1);
          matchesInGroup[grp].splice(m, 1);

          // one element left, so go back and decrease length
          m--;
          lenMatchesInGroupArray = matchesInGroup[grp].length;
          nrMatchesInGroup--;

          // Add match in matchesInRound array
          matchesInRound.push(newMatch);
          nrMatchesInRound++;
          break;
        }
      }

      // sanity check
      if (beforeNrMatchesInGroupLeft === nrMatchesInGroup) {
        this.logger.error('Error: Match not found, this should not happen!!\n');
        result.errorCount++;
        result.error = "internal_server_error";
        return result;
      }

      // sanity check
      if (nrMatchesInRound > nrLocations) {
        this.logger.error('Error: More matches than possible, this should not happen!!\n');
        result.errorCount++;
        result.error = "internal_server_error";
        return result;
      }

      // Update newMatch in db:
      var location = nrLocations - matchesPossible;
      var newTeamHome = newMatch[0];
      var newTeamAway = newMatch[1];
      scheduledMatchesForThisRound.push({
        stage: stage,
        status: "pending",
        location: location,
        bracket: grp,
        round: round,
        opponents: [{participant: newTeamHome, score: -1, advantage: 1},
          {participant: newTeamAway, score: -1, advantage: 0}],
        leg: leg
      });

      matchesPossible--;
      this.logger.info("location " + location + ": " + newMatch[0].team.name + " vs " + newMatch[1].team.name + "\n");
    }

    // fill result
    result.matchesInGroup = matchesInGroup;
    result.nrMatchesInGroup = nrMatchesInGroup;
    result.matchesPossible = matchesPossible;
    result.matchesInRound = matchesInRound;
    result.nrMatchesInRound = nrMatchesInRound;
    result.matchArray = matchArray;
    result.scheduledMatchesForThisRound = scheduledMatchesForThisRound;

    return result;
  }


  resultHasError(result, stageType): number {
    if (result.error.errorCount !== 0) {
      this.logger.error("Error: '" + stageType + "'-creation aborts with error: " + result.error.error + "!\n");
      return 1;
    } else {
      return 0;
    }
  }

  validateTournamentArgs(nrGroups: number, nrParticipants: number, legs: number, nrLocations: number, teams: Team[]): TournamentValidationError {
    let result;

    let nrGroupsError = this.hasError(nrGroups);
    if (nrGroupsError) {
      result.errorCount++;
      result.error.key = "groups";
      result.error.error = nrGroupsError;
    }

    let nrParticipantsError = this.hasError(nrParticipants);
    if (nrParticipantsError) {
      result.errorCount++;
      result.error.key = "nr_participants";
      result.error.error = nrParticipants;
    }

    let legsError = this.hasError(legs);
    if (legsError) {
      result.errorCount++;
      result.error.key = "legs";
      result.error.error = legs;
    }

    if (nrParticipants < teams.length) {
      result.error.key = "nr_participants";
      result.error.error = "invalid";
    }

    let nrLocationsError = this.hasError(nrLocations);
    if (nrLocationsError) {
      result.errorCount++;
      result.error.key = "locationss";
      result.error.error = "nrLocations";
    }

    return result;
  }

  hasError(arg) {
    var error;

    if (!arg) {
      error = "missing";
    }
    else if (arg <= 0) {
      error = "invalid";
    }

    return error || false;
  }

}

export interface TournamentConfig {
  teams: Team[];
  stages: Stage[];
}

export class Stage {
  stageType: string;
  nrGroups: number;
  nrParticipants: number;
  legs: number;
  nrLocations: number;
  teams: Team[];

  toString(): string {
    return "stageType: " + this.stageType + " nrGroups: " + this.nrGroups + " nrParticipants: " + this.nrParticipants + " legs: " + this.legs + " nrLocations: " + this.nrLocations + " teams count: " + this.teams.length;
  }
}

export class Team {
  name: string;

  constructor(name: string) {

  }
}

export class Participant {
  team: Team;
  score: number;

  constructor(team: Team, score: number) {
  }
}

export interface TournamentValidationError {
  errorCount: number;
  error: ValidationError;
}

export interface ValidationError {
  key: string;
  error: string;
}
