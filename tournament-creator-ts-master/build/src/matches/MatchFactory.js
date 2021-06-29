"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const MatchToken_1 = require("../matchtokens/MatchToken");
class MatchFactory {
    static createMatches(participants, stageOrder, nrGroups, nrParticipants, dummyParticipants, phase, leg) {
        let output = {
            matchArray: [[[]]],
            groups: [[]]
        };
        if (nrParticipants <= 1) {
            return output;
        }
        // Find all Matches;
        let startGrpMember = 0;
        let nrGroupsLeft = nrGroups;
        let grpMemberArray;
        //TournamentCreator.Logger.info("-- List of all matches --\n");
        for (let grp = 0; grp < nrGroups; grp++) {
            var matchArrayidx = 0;
            let nrMemberPerGroup = Math.ceil(nrParticipants / nrGroupsLeft); // auf integer aufrunden
            grpMemberArray = participants.slice(startGrpMember, startGrpMember + nrMemberPerGroup);
            nrGroupsLeft--;
            startGrpMember += nrMemberPerGroup;
            let nrGrpMember = grpMemberArray.length;
            nrParticipants = nrParticipants - nrGrpMember;
            if (dummyParticipants) {
                grpMemberArray = MatchFactory.createTokens(nrGrpMember, dummyParticipants, stageOrder, phase, grp);
            }
            // If uneven number of members, add empty member
            while ((nrGrpMember % 2) !== 0 || nrGrpMember == 0) {
                grpMemberArray.push(MatchFactory.EMPTY_ENTRY);
                nrGrpMember++;
            }
            if (!output.groups[grp])
                output.groups[grp] = [];
            output.groups[grp] = grpMemberArray;
            let nrMatches = (nrGrpMember - 1) * (nrGrpMember) / 2; // Gaußsche Summenformel: nrMatches = 6
            let p = 0;
            let q = 1;
            for (let j = 0; j < nrMatches; j++) {
                if (!output.matchArray[grp])
                    output.matchArray[grp] = [[]];
                if (((j + leg) % 2) === 0) {
                    //TournamentCreator.Logger.info(" " + grpMemberArray[p].token + " vs " + grpMemberArray[q].token + "\n");
                    //console.log(grpMemberArray[p].token+" vs "+grpMemberArray[q].token);
                    output.matchArray[grp][matchArrayidx] = [grpMemberArray[p], grpMemberArray[q]]; // TODO: add participaobject here and not participants name
                    matchArrayidx++;
                }
                else {
                    //TournamentCreator.Logger.info(" " + grpMemberArray[q].token + " vs " + grpMemberArray[p].token + "\n");
                    //console.log(grpMemberArray[p].token+" vs "+grpMemberArray[q].token);
                    output.matchArray[grp][matchArrayidx] = [grpMemberArray[q], grpMemberArray[p]]; // TODO: add participaobject here and not participants name
                    matchArrayidx++;
                }
                if (q >= nrGrpMember - 1) {
                    p++;
                    q = p + 1;
                }
                else {
                    q++;
                }
            }
            //TournamentCreator.Logger.info("\n");
        }
        return output;
    }
    static createTokens(nrParticipants, dummyParticipants, stageOrder, phase, group) {
        let tokens = [];
        for (let i = 0; i < nrParticipants; i++) {
            let participant = new MatchToken_1.MatchToken();
            if (dummyParticipants) {
                participant.id = i;
                // naming convention: [stage][phase][a-z][A-Z][1234...]
                // For a group stage -> single elimination stage this creates the following tokens:
                // 00aA0 vs 00aA1  | 
                // 00aA0 vs 00aA2  |    10aA1 vs 10aA2    11aA1 vs 11aA2   12aA1 vs 12aA2
                // 00aA0 vs 00aA3  |    
                // 00aA1 vs 00aA2  |    10aB1 vs 10aB2    11aB1 vs 11aB2       ...
                // ...           |        ...             ...
                // 00aB0 vs 00aB1  |
                // 00aB0 vs 00aB2  |
                // ...
                //                   |
                // stage 0           | stage 1
                //   phase 0         |   phase 0         phase 1       phase 2
                // a = 97 ... z = 122 A = 65 ... Z = 90
                let groupNameFirst = 97 + Math.floor(group / 26); // 26 chars
                let groupNameSecond = 65 + (((group % 26) + 26) % 26);
                participant.token = stageOrder.toString() + phase.toString() + String.fromCharCode(groupNameFirst) + String.fromCharCode(groupNameSecond) + i.toString();
            }
            tokens.push(participant);
        }
        return tokens;
    }
}
MatchFactory.EMPTY_ENTRY = { token: "empty", score: -1, advantage: 0, resultApprovedTimestamp: 0, user: { id: -1, username: "empty" } };
exports.MatchFactory = MatchFactory;
//# sourceMappingURL=MatchFactory.js.map