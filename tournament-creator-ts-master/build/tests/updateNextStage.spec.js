"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const helperFunctions_spec_1 = require("./helperFunctions.spec");
const MatchFactory_1 = require("../src/matches/MatchFactory");
describe('updateNextStage grp->se', () => {
    it('should update next stage correctly for grp1->se1', () => {
        let stages = [
            {
                nrGroups: 1,
                nrParticipants: 2,
                stageType: 'GROUP',
                legs: 1,
                nrLocations: 1,
                thirdPlaceMatch: true
            },
            {
                nrGroups: 1,
                nrParticipants: 2,
                stageType: 'SINGLE_ELIMINATION',
                legs: 1,
                nrLocations: 1,
                thirdPlaceMatch: true
            }
        ];
        let result = [
            [
                { 'token': '10aA0', 'advantage': 1, 'username': 'A0' },
                { 'token': '10aA1', 'advantage': 0, 'username': 'A1' },
            ],
        ];
        let tournament = helperFunctions_spec_1.TestHelperFunctions.buildTournament(stages, true);
        expect(helperFunctions_spec_1.TestHelperFunctions.checkUpdateNextStageResult(tournament, 0, result)).toBeTruthy();
    });
    it('should update next stage correctly for grp1->se2', () => {
        let stages = [
            {
                nrGroups: 1,
                nrParticipants: 4,
                stageType: 'GROUP',
                legs: 1,
                nrLocations: 1,
                thirdPlaceMatch: true
            },
            {
                nrGroups: 2,
                nrParticipants: 4,
                stageType: 'SINGLE_ELIMINATION',
                legs: 1,
                nrLocations: 1,
                thirdPlaceMatch: true
            }
        ];
        let result = [
            [
                { 'token': '10aA0', 'advantage': 1, 'username': 'A0' },
                { 'token': '10aB0', 'advantage': 1, 'username': 'A1' },
                { 'token': '10aB1', 'advantage': 0, 'username': 'A2' },
                { 'token': '10aA1', 'advantage': 0, 'username': 'A3' },
            ],
        ];
        let tournament = helperFunctions_spec_1.TestHelperFunctions.buildTournament(stages, true);
        expect(helperFunctions_spec_1.TestHelperFunctions.checkUpdateNextStageResult(tournament, 0, result)).toBeTruthy();
    });
    it('should update next stage correctly for grp1->se4', () => {
        let stages = [
            {
                nrGroups: 1,
                nrParticipants: 8,
                stageType: 'GROUP',
                legs: 1,
                nrLocations: 1,
                thirdPlaceMatch: true
            },
            {
                nrGroups: 4,
                nrParticipants: 8,
                stageType: 'SINGLE_ELIMINATION',
                legs: 1,
                nrLocations: 1,
                thirdPlaceMatch: true
            }
        ];
        let result = [
            [
                { 'token': '10aA0', 'advantage': 1, 'username': 'A0' },
                { 'token': '10aC0', 'advantage': 1, 'username': 'A1' },
                { 'token': '10aD0', 'advantage': 1, 'username': 'A2' },
                { 'token': '10aB0', 'advantage': 1, 'username': 'A3' },
                { 'token': '10aB1', 'advantage': 0, 'username': 'A4' },
                { 'token': '10aD1', 'advantage': 0, 'username': 'A5' },
                { 'token': '10aC1', 'advantage': 0, 'username': 'A6' },
                { 'token': '10aA1', 'advantage': 0, 'username': 'A7' },
            ],
        ];
        let tournament = helperFunctions_spec_1.TestHelperFunctions.buildTournament(stages, true);
        expect(helperFunctions_spec_1.TestHelperFunctions.checkUpdateNextStageResult(tournament, 0, result)).toBeTruthy();
    });
    it('should update next stage correctly for grp2->se1', () => {
        let stages = [
            {
                nrGroups: 2,
                nrParticipants: 2,
                stageType: 'GROUP',
                legs: 1,
                nrLocations: 1,
                thirdPlaceMatch: true
            },
            {
                nrGroups: 1,
                nrParticipants: 2,
                stageType: 'SINGLE_ELIMINATION',
                legs: 1,
                nrLocations: 1,
                thirdPlaceMatch: true
            }
        ];
        let result = [
            [
                { 'token': '10aA0', 'advantage': 1, 'username': 'A0' },
            ],
            [
                { 'token': '10aA1', 'advantage': 0, 'username': 'B0' },
            ],
        ];
        let tournament = helperFunctions_spec_1.TestHelperFunctions.buildTournament(stages, true);
        expect(helperFunctions_spec_1.TestHelperFunctions.checkUpdateNextStageResult(tournament, 0, result)).toBeTruthy();
    });
    it('should update next stage correctly for grp2->se2', () => {
        let stages = [
            {
                nrGroups: 2,
                nrParticipants: 4,
                stageType: 'GROUP',
                legs: 1,
                nrLocations: 1,
                thirdPlaceMatch: true
            },
            {
                nrGroups: 2,
                nrParticipants: 4,
                stageType: 'SINGLE_ELIMINATION',
                legs: 1,
                nrLocations: 1,
                thirdPlaceMatch: true
            }
        ];
        let result = [
            [
                { 'token': '10aA0', 'advantage': 1, 'username': 'A0' },
                { 'token': '10aB1', 'advantage': 0, 'username': 'A1' },
            ],
            [
                { 'token': '10aB0', 'advantage': 1, 'username': 'B0' },
                { 'token': '10aA1', 'advantage': 0, 'username': 'B1' },
            ],
        ];
        let tournament = helperFunctions_spec_1.TestHelperFunctions.buildTournament(stages, true);
        expect(helperFunctions_spec_1.TestHelperFunctions.checkUpdateNextStageResult(tournament, 0, result)).toBeTruthy();
    });
    it('should update next stage correctly for grp2->se4', () => {
        let stages = [
            {
                nrGroups: 2,
                nrParticipants: 8,
                stageType: 'GROUP',
                legs: 1,
                nrLocations: 1,
                thirdPlaceMatch: true
            },
            {
                nrGroups: 4,
                nrParticipants: 8,
                stageType: 'SINGLE_ELIMINATION',
                legs: 1,
                nrLocations: 1,
                thirdPlaceMatch: true
            }
        ];
        let result = [
            [
                { 'token': '10aA0', 'advantage': 1, 'username': 'A0' },
                { 'token': '10aD0', 'advantage': 1, 'username': 'A1' },
                { 'token': '10aB1', 'advantage': 0, 'username': 'A2' },
                { 'token': '10aC1', 'advantage': 0, 'username': 'A3' },
            ],
            [
                { 'token': '10aC0', 'advantage': 1, 'username': 'B0' },
                { 'token': '10aB0', 'advantage': 1, 'username': 'B1' },
                { 'token': '10aD1', 'advantage': 0, 'username': 'B2' },
                { 'token': '10aA1', 'advantage': 0, 'username': 'B3' },
            ],
        ];
        let tournament = helperFunctions_spec_1.TestHelperFunctions.buildTournament(stages, true);
        expect(helperFunctions_spec_1.TestHelperFunctions.checkUpdateNextStageResult(tournament, 0, result)).toBeTruthy();
    });
    it('should update next stage correctly for grp2->se8', () => {
        let stages = [
            {
                nrGroups: 2,
                nrParticipants: 16,
                stageType: 'GROUP',
                legs: 1,
                nrLocations: 1,
                thirdPlaceMatch: true
            },
            {
                nrGroups: 8,
                nrParticipants: 16,
                stageType: 'SINGLE_ELIMINATION',
                legs: 1,
                nrLocations: 1,
                thirdPlaceMatch: true
            }
        ];
        let result = [
            [
                { 'token': '10aA0', 'advantage': 1, 'username': 'A0' },
                { 'token': '10aG0', 'advantage': 1, 'username': 'A1' },
                { 'token': '10aD0', 'advantage': 1, 'username': 'A2' },
                { 'token': '10aF0', 'advantage': 1, 'username': 'A3' },
                { 'token': '10aB1', 'advantage': 0, 'username': 'A4' },
                { 'token': '10aH1', 'advantage': 0, 'username': 'A5' },
                { 'token': '10aC1', 'advantage': 0, 'username': 'A6' },
                { 'token': '10aE1', 'advantage': 0, 'username': 'A7' },
            ],
            [
                { 'token': '10aE0', 'advantage': 1, 'username': 'B0' },
                { 'token': '10aC0', 'advantage': 1, 'username': 'B1' },
                { 'token': '10aH0', 'advantage': 1, 'username': 'B2' },
                { 'token': '10aB0', 'advantage': 1, 'username': 'B3' },
                { 'token': '10aF1', 'advantage': 0, 'username': 'B4' },
                { 'token': '10aD1', 'advantage': 0, 'username': 'B5' },
                { 'token': '10aG1', 'advantage': 0, 'username': 'B6' },
                { 'token': '10aA1', 'advantage': 0, 'username': 'B7' },
            ],
        ];
        let tournament = helperFunctions_spec_1.TestHelperFunctions.buildTournament(stages, true);
        expect(helperFunctions_spec_1.TestHelperFunctions.checkUpdateNextStageResult(tournament, 0, result)).toBeTruthy();
    });
    it('should update next stage correctly for grp4->se2', () => {
        let stages = [
            {
                nrGroups: 4,
                nrParticipants: 4,
                stageType: 'GROUP',
                legs: 1,
                nrLocations: 1,
                thirdPlaceMatch: true
            },
            {
                nrGroups: 2,
                nrParticipants: 4,
                stageType: 'SINGLE_ELIMINATION',
                legs: 1,
                nrLocations: 1,
                thirdPlaceMatch: true
            }
        ];
        let result = [
            [
                { 'token': '10aA0', 'advantage': 1, 'username': 'A0' },
            ],
            [
                { 'token': '10aA1', 'advantage': 0, 'username': 'B0' },
            ],
            [
                { 'token': '10aB0', 'advantage': 1, 'username': 'C0' },
            ],
            [
                { 'token': '10aB1', 'advantage': 0, 'username': 'D0' },
            ],
        ];
        let tournament = helperFunctions_spec_1.TestHelperFunctions.buildTournament(stages, true);
        expect(helperFunctions_spec_1.TestHelperFunctions.checkUpdateNextStageResult(tournament, 0, result)).toBeTruthy();
    });
    it('should update next stage correctly for grp4->se4', () => {
        let stages = [
            {
                nrGroups: 4,
                nrParticipants: 8,
                stageType: 'GROUP',
                legs: 1,
                nrLocations: 1,
                thirdPlaceMatch: true
            },
            {
                nrGroups: 4,
                nrParticipants: 8,
                stageType: 'SINGLE_ELIMINATION',
                legs: 1,
                nrLocations: 1,
                thirdPlaceMatch: true
            }
        ];
        let result = [
            [
                { 'token': '10aA0', 'advantage': 1, 'username': 'A0' },
                { 'token': '10aC1', 'advantage': 0, 'username': 'A1' },
            ],
            [
                { 'token': '10aC0', 'advantage': 1, 'username': 'B0' },
                { 'token': '10aA1', 'advantage': 0, 'username': 'B1' },
            ],
            [
                { 'token': '10aB0', 'advantage': 1, 'username': 'C0' },
                { 'token': '10aD1', 'advantage': 0, 'username': 'C1' },
            ],
            [
                { 'token': '10aD0', 'advantage': 1, 'username': 'D0' },
                { 'token': '10aB1', 'advantage': 0, 'username': 'D1' },
            ],
        ];
        let tournament = helperFunctions_spec_1.TestHelperFunctions.buildTournament(stages, true);
        expect(helperFunctions_spec_1.TestHelperFunctions.checkUpdateNextStageResult(tournament, 0, result)).toBeTruthy();
    });
    it('should update next stage correctly for grp4->se8', () => {
        let stages = [
            {
                nrGroups: 4,
                nrParticipants: 16,
                stageType: 'GROUP',
                legs: 1,
                nrLocations: 1,
                thirdPlaceMatch: true
            },
            {
                nrGroups: 8,
                nrParticipants: 16,
                stageType: 'SINGLE_ELIMINATION',
                legs: 1,
                nrLocations: 1,
                thirdPlaceMatch: true
            }
        ];
        let result = [
            [
                { 'token': '10aA0', 'advantage': 1, 'username': 'A0' },
                { 'token': '10aF0', 'advantage': 1, 'username': 'A1' },
                { 'token': '10aH1', 'advantage': 0, 'username': 'A2' },
                { 'token': '10aC1', 'advantage': 0, 'username': 'A3' },
            ],
            [
                { 'token': '10aC0', 'advantage': 1, 'username': 'B0' },
                { 'token': '10aH0', 'advantage': 1, 'username': 'B1' },
                { 'token': '10aF1', 'advantage': 0, 'username': 'B2' },
                { 'token': '10aA1', 'advantage': 0, 'username': 'B3' },
            ],
            [
                { 'token': '10aE0', 'advantage': 1, 'username': 'C0' },
                { 'token': '10aB0', 'advantage': 1, 'username': 'C1' },
                { 'token': '10aD1', 'advantage': 0, 'username': 'C2' },
                { 'token': '10aG1', 'advantage': 0, 'username': 'C3' },
            ],
            [
                { 'token': '10aG0', 'advantage': 1, 'username': 'D0' },
                { 'token': '10aD0', 'advantage': 1, 'username': 'D1' },
                { 'token': '10aB1', 'advantage': 0, 'username': 'D2' },
                { 'token': '10aE1', 'advantage': 0, 'username': 'D3' },
            ],
        ];
        let tournament = helperFunctions_spec_1.TestHelperFunctions.buildTournament(stages, true);
        expect(helperFunctions_spec_1.TestHelperFunctions.checkUpdateNextStageResult(tournament, 0, result)).toBeTruthy();
    });
    it('should update next stage correctly for grp4->se16', () => {
        let stages = [
            {
                nrGroups: 4,
                nrParticipants: 32,
                stageType: 'GROUP',
                legs: 1,
                nrLocations: 1,
                thirdPlaceMatch: true
            },
            {
                nrGroups: 16,
                nrParticipants: 32,
                stageType: 'SINGLE_ELIMINATION',
                legs: 1,
                nrLocations: 1,
                thirdPlaceMatch: true
            }
        ];
        let result = [
            [
                { 'token': '10aA0', 'advantage': 1, 'username': 'A0' },
                { 'token': '10aK0', 'advantage': 1, 'username': 'A1' },
                { 'token': '10aP0', 'advantage': 1, 'username': 'A2' },
                { 'token': '10aF0', 'advantage': 1, 'username': 'A3' },
                { 'token': '10aN1', 'advantage': 0, 'username': 'A4' },
                { 'token': '10aH1', 'advantage': 0, 'username': 'A5' },
                { 'token': '10aC1', 'advantage': 0, 'username': 'A6' },
                { 'token': '10aI1', 'advantage': 0, 'username': 'A7' },
            ],
            [
                { 'token': '10aI0', 'advantage': 1, 'username': 'B0' },
                { 'token': '10aC0', 'advantage': 1, 'username': 'B1' },
                { 'token': '10aH0', 'advantage': 1, 'username': 'B2' },
                { 'token': '10aN0', 'advantage': 1, 'username': 'B3' },
                { 'token': '10aF1', 'advantage': 0, 'username': 'B4' },
                { 'token': '10aP1', 'advantage': 0, 'username': 'B5' },
                { 'token': '10aK1', 'advantage': 0, 'username': 'B6' },
                { 'token': '10aA1', 'advantage': 0, 'username': 'B7' },
            ],
            [
                { 'token': '10aE0', 'advantage': 1, 'username': 'C0' },
                { 'token': '10aO0', 'advantage': 1, 'username': 'C1' },
                { 'token': '10aL0', 'advantage': 1, 'username': 'C2' },
                { 'token': '10aB0', 'advantage': 1, 'username': 'C3' },
                { 'token': '10aJ1', 'advantage': 0, 'username': 'C4' },
                { 'token': '10aD1', 'advantage': 0, 'username': 'C5' },
                { 'token': '10aG1', 'advantage': 0, 'username': 'C6' },
                { 'token': '10aM1', 'advantage': 0, 'username': 'C7' },
            ],
            [
                { 'token': '10aM0', 'advantage': 1, 'username': 'D0' },
                { 'token': '10aG0', 'advantage': 1, 'username': 'D1' },
                { 'token': '10aD0', 'advantage': 1, 'username': 'D2' },
                { 'token': '10aJ0', 'advantage': 1, 'username': 'D3' },
                { 'token': '10aB1', 'advantage': 0, 'username': 'D4' },
                { 'token': '10aL1', 'advantage': 0, 'username': 'D5' },
                { 'token': '10aO1', 'advantage': 0, 'username': 'D6' },
                { 'token': '10aE1', 'advantage': 0, 'username': 'D7' },
            ],
        ];
        let tournament = helperFunctions_spec_1.TestHelperFunctions.buildTournament(stages, true);
        expect(helperFunctions_spec_1.TestHelperFunctions.checkUpdateNextStageResult(tournament, 0, result)).toBeTruthy();
    });
    it('should update next stage correctly for grp8->se4', () => {
        let stages = [
            {
                nrGroups: 8,
                nrParticipants: 8,
                stageType: 'GROUP',
                legs: 1,
                nrLocations: 1,
                thirdPlaceMatch: true
            },
            {
                nrGroups: 4,
                nrParticipants: 8,
                stageType: 'SINGLE_ELIMINATION',
                legs: 1,
                nrLocations: 1,
                thirdPlaceMatch: true
            }
        ];
        let result = [
            [
                { 'token': '10aA0', 'advantage': 1, 'username': 'A0' },
            ],
            [
                { 'token': '10aA1', 'advantage': 0, 'username': 'B0' },
            ],
            [
                { 'token': '10aB0', 'advantage': 1, 'username': 'C0' },
            ],
            [
                { 'token': '10aB1', 'advantage': 0, 'username': 'D0' },
            ],
            [
                { 'token': '10aC0', 'advantage': 1, 'username': 'E0' },
            ],
            [
                { 'token': '10aC1', 'advantage': 0, 'username': 'F0' },
            ],
            [
                { 'token': '10aD0', 'advantage': 1, 'username': 'G0' },
            ],
            [
                { 'token': '10aD1', 'advantage': 0, 'username': 'H0' },
            ],
        ];
        let tournament = helperFunctions_spec_1.TestHelperFunctions.buildTournament(stages, true);
        expect(helperFunctions_spec_1.TestHelperFunctions.checkUpdateNextStageResult(tournament, 0, result)).toBeTruthy();
    });
    it('should update next stage correctly for grp8->se8', () => {
        let stages = [
            {
                nrGroups: 8,
                nrParticipants: 16,
                stageType: 'GROUP',
                legs: 1,
                nrLocations: 1,
                thirdPlaceMatch: true
            },
            {
                nrGroups: 8,
                nrParticipants: 16,
                stageType: 'SINGLE_ELIMINATION',
                legs: 1,
                nrLocations: 1,
                thirdPlaceMatch: true
            }
        ];
        let result = [
            [
                { 'token': '10aA0', 'advantage': 1, 'username': 'A0' },
                { 'token': '10aE1', 'advantage': 0, 'username': 'A1' },
            ],
            [
                { 'token': '10aE0', 'advantage': 1, 'username': 'B0' },
                { 'token': '10aA1', 'advantage': 0, 'username': 'B1' },
            ],
            [
                { 'token': '10aB0', 'advantage': 1, 'username': 'C0' },
                { 'token': '10aF1', 'advantage': 0, 'username': 'C1' },
            ],
            [
                { 'token': '10aF0', 'advantage': 1, 'username': 'D0' },
                { 'token': '10aB1', 'advantage': 0, 'username': 'D1' },
            ],
            [
                { 'token': '10aC0', 'advantage': 1, 'username': 'E0' },
                { 'token': '10aG1', 'advantage': 0, 'username': 'E1' },
            ],
            [
                { 'token': '10aG0', 'advantage': 1, 'username': 'F0' },
                { 'token': '10aC1', 'advantage': 0, 'username': 'F1' },
            ],
            [
                { 'token': '10aD0', 'advantage': 1, 'username': 'G0' },
                { 'token': '10aH1', 'advantage': 0, 'username': 'G1' },
            ],
            [
                { 'token': '10aH0', 'advantage': 1, 'username': 'H0' },
                { 'token': '10aD1', 'advantage': 0, 'username': 'H1' },
            ],
        ];
        let tournament = helperFunctions_spec_1.TestHelperFunctions.buildTournament(stages, true);
        expect(helperFunctions_spec_1.TestHelperFunctions.checkUpdateNextStageResult(tournament, 0, result)).toBeTruthy();
    });
    it('should update next stage correctly for grp8->se16', () => {
        let stages = [
            {
                nrGroups: 8,
                nrParticipants: 32,
                stageType: 'GROUP',
                legs: 1,
                nrLocations: 1,
                thirdPlaceMatch: true
            },
            {
                nrGroups: 16,
                nrParticipants: 32,
                stageType: 'SINGLE_ELIMINATION',
                legs: 1,
                nrLocations: 1,
                thirdPlaceMatch: true
            }
        ];
        let result = [
            [
                { 'token': '10aA0', 'advantage': 1, 'username': 'A0' },
                { 'token': '10aJ0', 'advantage': 1, 'username': 'A1' },
                { 'token': '10aN1', 'advantage': 0, 'username': 'A2' },
                { 'token': '10aE1', 'advantage': 0, 'username': 'A3' },
            ],
            [
                { 'token': '10aE0', 'advantage': 1, 'username': 'B0' },
                { 'token': '10aN0', 'advantage': 1, 'username': 'B1' },
                { 'token': '10aJ1', 'advantage': 0, 'username': 'B2' },
                { 'token': '10aA1', 'advantage': 0, 'username': 'B3' },
            ],
            [
                { 'token': '10aI0', 'advantage': 1, 'username': 'C0' },
                { 'token': '10aB0', 'advantage': 1, 'username': 'C1' },
                { 'token': '10aF1', 'advantage': 0, 'username': 'C2' },
                { 'token': '10aM1', 'advantage': 0, 'username': 'C3' },
            ],
            [
                { 'token': '10aM0', 'advantage': 1, 'username': 'D0' },
                { 'token': '10aF0', 'advantage': 1, 'username': 'D1' },
                { 'token': '10aB1', 'advantage': 0, 'username': 'D2' },
                { 'token': '10aI1', 'advantage': 0, 'username': 'D3' },
            ],
            [
                { 'token': '10aC0', 'advantage': 1, 'username': 'E0' },
                { 'token': '10aL0', 'advantage': 1, 'username': 'E1' },
                { 'token': '10aP1', 'advantage': 0, 'username': 'E2' },
                { 'token': '10aG1', 'advantage': 0, 'username': 'E3' },
            ],
            [
                { 'token': '10aG0', 'advantage': 1, 'username': 'F0' },
                { 'token': '10aP0', 'advantage': 1, 'username': 'F1' },
                { 'token': '10aL1', 'advantage': 0, 'username': 'F2' },
                { 'token': '10aC1', 'advantage': 0, 'username': 'F3' },
            ],
            [
                { 'token': '10aK0', 'advantage': 1, 'username': 'G0' },
                { 'token': '10aD0', 'advantage': 1, 'username': 'G1' },
                { 'token': '10aH1', 'advantage': 0, 'username': 'G2' },
                { 'token': '10aO1', 'advantage': 0, 'username': 'G3' },
            ],
            [
                { 'token': '10aO0', 'advantage': 1, 'username': 'H0' },
                { 'token': '10aH0', 'advantage': 1, 'username': 'H1' },
                { 'token': '10aD1', 'advantage': 0, 'username': 'H2' },
                { 'token': '10aK1', 'advantage': 0, 'username': 'H3' },
            ],
        ];
        let tournament = helperFunctions_spec_1.TestHelperFunctions.buildTournament(stages, true);
        expect(helperFunctions_spec_1.TestHelperFunctions.checkUpdateNextStageResult(tournament, 0, result)).toBeTruthy();
    });
    it('should update next stage correctly for grp8->se32', () => {
        let stages = [
            {
                nrGroups: 8,
                nrParticipants: 64,
                stageType: 'GROUP',
                legs: 1,
                nrLocations: 1,
                thirdPlaceMatch: true
            },
            {
                nrGroups: 32,
                nrParticipants: 64,
                stageType: 'SINGLE_ELIMINATION',
                legs: 1,
                nrLocations: 1,
                thirdPlaceMatch: true
            }
        ];
        let result = [
            [
                { 'token': '10aA0', 'advantage': 1, 'username': 'A0' },
                { 'token': '10aS0', 'advantage': 1, 'username': 'A1' },
                { 'token': '10bF0', 'advantage': 1, 'username': 'A2' },
                { 'token': '10aN0', 'advantage': 1, 'username': 'A3' },
                { 'token': '10aJ1', 'advantage': 0, 'username': 'A4' },
                { 'token': '10bB1', 'advantage': 0, 'username': 'A5' },
                { 'token': '10aW1', 'advantage': 0, 'username': 'A6' },
                { 'token': '10aE1', 'advantage': 0, 'username': 'A7' },
            ],
            [
                { 'token': '10aE0', 'advantage': 1, 'username': 'B0' },
                { 'token': '10aW0', 'advantage': 1, 'username': 'B1' },
                { 'token': '10bB0', 'advantage': 1, 'username': 'B2' },
                { 'token': '10aJ0', 'advantage': 1, 'username': 'B3' },
                { 'token': '10aN1', 'advantage': 0, 'username': 'B4' },
                { 'token': '10bF1', 'advantage': 0, 'username': 'B5' },
                { 'token': '10aS1', 'advantage': 0, 'username': 'B6' },
                { 'token': '10aA1', 'advantage': 0, 'username': 'B7' },
            ],
            [
                { 'token': '10aI0', 'advantage': 1, 'username': 'C0' },
                { 'token': '10bA0', 'advantage': 1, 'username': 'C1' },
                { 'token': '10aX0', 'advantage': 1, 'username': 'C2' },
                { 'token': '10aF0', 'advantage': 1, 'username': 'C3' },
                { 'token': '10aB1', 'advantage': 0, 'username': 'C4' },
                { 'token': '10aT1', 'advantage': 0, 'username': 'C5' },
                { 'token': '10bE1', 'advantage': 0, 'username': 'C6' },
                { 'token': '10aM1', 'advantage': 0, 'username': 'C7' },
            ],
            [
                { 'token': '10aM0', 'advantage': 1, 'username': 'D0' },
                { 'token': '10bE0', 'advantage': 1, 'username': 'D1' },
                { 'token': '10aT0', 'advantage': 1, 'username': 'D2' },
                { 'token': '10aB0', 'advantage': 1, 'username': 'D3' },
                { 'token': '10aF1', 'advantage': 0, 'username': 'D4' },
                { 'token': '10aX1', 'advantage': 0, 'username': 'D5' },
                { 'token': '10bA1', 'advantage': 0, 'username': 'D6' },
                { 'token': '10aI1', 'advantage': 0, 'username': 'D7' },
            ],
            [
                { 'token': '10aQ0', 'advantage': 1, 'username': 'E0' },
                { 'token': '10aC0', 'advantage': 1, 'username': 'E1' },
                { 'token': '10aP0', 'advantage': 1, 'username': 'E2' },
                { 'token': '10bD0', 'advantage': 1, 'username': 'E3' },
                { 'token': '10aZ1', 'advantage': 0, 'username': 'E4' },
                { 'token': '10aL1', 'advantage': 0, 'username': 'E5' },
                { 'token': '10aG1', 'advantage': 0, 'username': 'E6' },
                { 'token': '10aU1', 'advantage': 0, 'username': 'E7' },
            ],
            [
                { 'token': '10aU0', 'advantage': 1, 'username': 'F0' },
                { 'token': '10aG0', 'advantage': 1, 'username': 'F1' },
                { 'token': '10aL0', 'advantage': 1, 'username': 'F2' },
                { 'token': '10aZ0', 'advantage': 1, 'username': 'F3' },
                { 'token': '10bD1', 'advantage': 0, 'username': 'F4' },
                { 'token': '10aP1', 'advantage': 0, 'username': 'F5' },
                { 'token': '10aC1', 'advantage': 0, 'username': 'F6' },
                { 'token': '10aQ1', 'advantage': 0, 'username': 'F7' },
            ],
            [
                { 'token': '10aY0', 'advantage': 1, 'username': 'G0' },
                { 'token': '10aK0', 'advantage': 1, 'username': 'G1' },
                { 'token': '10aH0', 'advantage': 1, 'username': 'G2' },
                { 'token': '10aV0', 'advantage': 1, 'username': 'G3' },
                { 'token': '10aR1', 'advantage': 0, 'username': 'G4' },
                { 'token': '10aD1', 'advantage': 0, 'username': 'G5' },
                { 'token': '10aO1', 'advantage': 0, 'username': 'G6' },
                { 'token': '10bC1', 'advantage': 0, 'username': 'G7' },
            ],
            [
                { 'token': '10bC0', 'advantage': 1, 'username': 'H0' },
                { 'token': '10aO0', 'advantage': 1, 'username': 'H1' },
                { 'token': '10aD0', 'advantage': 1, 'username': 'H2' },
                { 'token': '10aR0', 'advantage': 1, 'username': 'H3' },
                { 'token': '10aV1', 'advantage': 0, 'username': 'H4' },
                { 'token': '10aH1', 'advantage': 0, 'username': 'H5' },
                { 'token': '10aK1', 'advantage': 0, 'username': 'H6' },
                { 'token': '10aY1', 'advantage': 0, 'username': 'H7' },
            ],
        ];
        let tournament = helperFunctions_spec_1.TestHelperFunctions.buildTournament(stages, true);
        expect(helperFunctions_spec_1.TestHelperFunctions.checkUpdateNextStageResult(tournament, 0, result)).toBeTruthy();
    });
    it('should update next stage correctly for grp8->se64', () => {
        let stages = [
            {
                nrGroups: 8,
                nrParticipants: 128,
                stageType: 'GROUP',
                legs: 1,
                nrLocations: 1,
                thirdPlaceMatch: true
            },
            {
                nrGroups: 64,
                nrParticipants: 128,
                stageType: 'SINGLE_ELIMINATION',
                legs: 1,
                nrLocations: 1,
                thirdPlaceMatch: true
            }
        ];
        let result = [
            [
                { 'token': '10aA0', 'advantage': 1, 'username': 'A0' },
                { 'token': '10bK0', 'advantage': 1, 'username': 'A1' },
                { 'token': '10cL0', 'advantage': 1, 'username': 'A2' },
                { 'token': '10bB0', 'advantage': 1, 'username': 'A3' },
                { 'token': '10aS0', 'advantage': 1, 'username': 'A4' },
                { 'token': '10cC0', 'advantage': 1, 'username': 'A5' },
                { 'token': '10bT0', 'advantage': 1, 'username': 'A6' },
                { 'token': '10aJ0', 'advantage': 1, 'username': 'A7' },
                { 'token': '10bP1', 'advantage': 0, 'username': 'A8' },
                { 'token': '10aN1', 'advantage': 0, 'username': 'A9' },
                { 'token': '10aW1', 'advantage': 0, 'username': 'A10' },
                { 'token': '10bY1', 'advantage': 0, 'username': 'A11' },
                { 'token': '10cH1', 'advantage': 0, 'username': 'A12' },
                { 'token': '10bF1', 'advantage': 0, 'username': 'A13' },
                { 'token': '10aE1', 'advantage': 0, 'username': 'A14' },
                { 'token': '10bG1', 'advantage': 0, 'username': 'A15' },
            ],
            [
                { 'token': '10bG0', 'advantage': 1, 'username': 'B0' },
                { 'token': '10aE0', 'advantage': 1, 'username': 'B1' },
                { 'token': '10bF0', 'advantage': 1, 'username': 'B2' },
                { 'token': '10cH0', 'advantage': 1, 'username': 'B3' },
                { 'token': '10bY0', 'advantage': 1, 'username': 'B4' },
                { 'token': '10aW0', 'advantage': 1, 'username': 'B5' },
                { 'token': '10aN0', 'advantage': 1, 'username': 'B6' },
                { 'token': '10bP0', 'advantage': 1, 'username': 'B7' },
                { 'token': '10aJ1', 'advantage': 0, 'username': 'B8' },
                { 'token': '10bT1', 'advantage': 0, 'username': 'B9' },
                { 'token': '10cC1', 'advantage': 0, 'username': 'B10' },
                { 'token': '10aS1', 'advantage': 0, 'username': 'B11' },
                { 'token': '10bB1', 'advantage': 0, 'username': 'B12' },
                { 'token': '10cL1', 'advantage': 0, 'username': 'B13' },
                { 'token': '10bK1', 'advantage': 0, 'username': 'B14' },
                { 'token': '10aA1', 'advantage': 0, 'username': 'B15' },
            ],
            [
                { 'token': '10aI0', 'advantage': 1, 'username': 'C0' },
                { 'token': '10bS0', 'advantage': 1, 'username': 'C1' },
                { 'token': '10cD0', 'advantage': 1, 'username': 'C2' },
                { 'token': '10aT0', 'advantage': 1, 'username': 'C3' },
                { 'token': '10bA0', 'advantage': 1, 'username': 'C4' },
                { 'token': '10cK0', 'advantage': 1, 'username': 'C5' },
                { 'token': '10bL0', 'advantage': 1, 'username': 'C6' },
                { 'token': '10aB0', 'advantage': 1, 'username': 'C7' },
                { 'token': '10bH1', 'advantage': 0, 'username': 'C8' },
                { 'token': '10aF1', 'advantage': 0, 'username': 'C9' },
                { 'token': '10bE1', 'advantage': 0, 'username': 'C10' },
                { 'token': '10cG1', 'advantage': 0, 'username': 'C11' },
                { 'token': '10bZ1', 'advantage': 0, 'username': 'C12' },
                { 'token': '10aX1', 'advantage': 0, 'username': 'C13' },
                { 'token': '10aM1', 'advantage': 0, 'username': 'C14' },
                { 'token': '10bO1', 'advantage': 0, 'username': 'C15' },
            ],
            [
                { 'token': '10bO0', 'advantage': 1, 'username': 'D0' },
                { 'token': '10aM0', 'advantage': 1, 'username': 'D1' },
                { 'token': '10aX0', 'advantage': 1, 'username': 'D2' },
                { 'token': '10bZ0', 'advantage': 1, 'username': 'D3' },
                { 'token': '10cG0', 'advantage': 1, 'username': 'D4' },
                { 'token': '10bE0', 'advantage': 1, 'username': 'D5' },
                { 'token': '10aF0', 'advantage': 1, 'username': 'D6' },
                { 'token': '10bH0', 'advantage': 1, 'username': 'D7' },
                { 'token': '10aB1', 'advantage': 0, 'username': 'D8' },
                { 'token': '10bL1', 'advantage': 0, 'username': 'D9' },
                { 'token': '10cK1', 'advantage': 0, 'username': 'D10' },
                { 'token': '10bA1', 'advantage': 0, 'username': 'D11' },
                { 'token': '10aT1', 'advantage': 0, 'username': 'D12' },
                { 'token': '10cD1', 'advantage': 0, 'username': 'D13' },
                { 'token': '10bS1', 'advantage': 0, 'username': 'D14' },
                { 'token': '10aI1', 'advantage': 0, 'username': 'D15' },
            ],
            [
                { 'token': '10aQ0', 'advantage': 1, 'username': 'E0' },
                { 'token': '10cA0', 'advantage': 1, 'username': 'E1' },
                { 'token': '10bV0', 'advantage': 1, 'username': 'E2' },
                { 'token': '10aL0', 'advantage': 1, 'username': 'E3' },
                { 'token': '10aC0', 'advantage': 1, 'username': 'E4' },
                { 'token': '10bM0', 'advantage': 1, 'username': 'E5' },
                { 'token': '10cJ0', 'advantage': 1, 'username': 'E6' },
                { 'token': '10aZ0', 'advantage': 1, 'username': 'E7' },
                { 'token': '10cF1', 'advantage': 0, 'username': 'E8' },
                { 'token': '10bD1', 'advantage': 0, 'username': 'E9' },
                { 'token': '10aG1', 'advantage': 0, 'username': 'E10' },
                { 'token': '10bI1', 'advantage': 0, 'username': 'E11' },
                { 'token': '10bR1', 'advantage': 0, 'username': 'E12' },
                { 'token': '10aP1', 'advantage': 0, 'username': 'E13' },
                { 'token': '10aU1', 'advantage': 0, 'username': 'E14' },
                { 'token': '10bW1', 'advantage': 0, 'username': 'E15' },
            ],
            [
                { 'token': '10bW0', 'advantage': 1, 'username': 'F0' },
                { 'token': '10aU0', 'advantage': 1, 'username': 'F1' },
                { 'token': '10aP0', 'advantage': 1, 'username': 'F2' },
                { 'token': '10bR0', 'advantage': 1, 'username': 'F3' },
                { 'token': '10bI0', 'advantage': 1, 'username': 'F4' },
                { 'token': '10aG0', 'advantage': 1, 'username': 'F5' },
                { 'token': '10bD0', 'advantage': 1, 'username': 'F6' },
                { 'token': '10cF0', 'advantage': 1, 'username': 'F7' },
                { 'token': '10aZ1', 'advantage': 0, 'username': 'F8' },
                { 'token': '10cJ1', 'advantage': 0, 'username': 'F9' },
                { 'token': '10bM1', 'advantage': 0, 'username': 'F10' },
                { 'token': '10aC1', 'advantage': 0, 'username': 'F11' },
                { 'token': '10aL1', 'advantage': 0, 'username': 'F12' },
                { 'token': '10bV1', 'advantage': 0, 'username': 'F13' },
                { 'token': '10cA1', 'advantage': 0, 'username': 'F14' },
                { 'token': '10aQ1', 'advantage': 0, 'username': 'F15' },
            ],
            [
                { 'token': '10aY0', 'advantage': 1, 'username': 'G0' },
                { 'token': '10cI0', 'advantage': 1, 'username': 'G1' },
                { 'token': '10bN0', 'advantage': 1, 'username': 'G2' },
                { 'token': '10aD0', 'advantage': 1, 'username': 'G3' },
                { 'token': '10aK0', 'advantage': 1, 'username': 'G4' },
                { 'token': '10bU0', 'advantage': 1, 'username': 'G5' },
                { 'token': '10cB0', 'advantage': 1, 'username': 'G6' },
                { 'token': '10aR0', 'advantage': 1, 'username': 'G7' },
                { 'token': '10bX1', 'advantage': 0, 'username': 'G8' },
                { 'token': '10aV1', 'advantage': 0, 'username': 'G9' },
                { 'token': '10aO1', 'advantage': 0, 'username': 'G10' },
                { 'token': '10bQ1', 'advantage': 0, 'username': 'G11' },
                { 'token': '10bJ1', 'advantage': 0, 'username': 'G12' },
                { 'token': '10aH1', 'advantage': 0, 'username': 'G13' },
                { 'token': '10bC1', 'advantage': 0, 'username': 'G14' },
                { 'token': '10cE1', 'advantage': 0, 'username': 'G15' },
            ],
            [
                { 'token': '10cE0', 'advantage': 1, 'username': 'H0' },
                { 'token': '10bC0', 'advantage': 1, 'username': 'H1' },
                { 'token': '10aH0', 'advantage': 1, 'username': 'H2' },
                { 'token': '10bJ0', 'advantage': 1, 'username': 'H3' },
                { 'token': '10bQ0', 'advantage': 1, 'username': 'H4' },
                { 'token': '10aO0', 'advantage': 1, 'username': 'H5' },
                { 'token': '10aV0', 'advantage': 1, 'username': 'H6' },
                { 'token': '10bX0', 'advantage': 1, 'username': 'H7' },
                { 'token': '10aR1', 'advantage': 0, 'username': 'H8' },
                { 'token': '10cB1', 'advantage': 0, 'username': 'H9' },
                { 'token': '10bU1', 'advantage': 0, 'username': 'H10' },
                { 'token': '10aK1', 'advantage': 0, 'username': 'H11' },
                { 'token': '10aD1', 'advantage': 0, 'username': 'H12' },
                { 'token': '10bN1', 'advantage': 0, 'username': 'H13' },
                { 'token': '10cI1', 'advantage': 0, 'username': 'H14' },
                { 'token': '10aY1', 'advantage': 0, 'username': 'H15' },
            ],
        ];
        let tournament = helperFunctions_spec_1.TestHelperFunctions.buildTournament(stages, true);
        expect(helperFunctions_spec_1.TestHelperFunctions.checkUpdateNextStageResult(tournament, 0, result)).toBeTruthy();
    });
    it('should update next stage correctly for grp16->se8', () => {
        let stages = [
            {
                nrGroups: 16,
                nrParticipants: 16,
                stageType: 'GROUP',
                legs: 1,
                nrLocations: 1,
                thirdPlaceMatch: true
            },
            {
                nrGroups: 8,
                nrParticipants: 16,
                stageType: 'SINGLE_ELIMINATION',
                legs: 1,
                nrLocations: 1,
                thirdPlaceMatch: true
            }
        ];
        let result = [
            [
                { 'token': '10aA0', 'advantage': 1, 'username': 'A0' },
            ],
            [
                { 'token': '10aA1', 'advantage': 0, 'username': 'B0' },
            ],
            [
                { 'token': '10aB0', 'advantage': 1, 'username': 'C0' },
            ],
            [
                { 'token': '10aB1', 'advantage': 0, 'username': 'D0' },
            ],
            [
                { 'token': '10aC0', 'advantage': 1, 'username': 'E0' },
            ],
            [
                { 'token': '10aC1', 'advantage': 0, 'username': 'F0' },
            ],
            [
                { 'token': '10aD0', 'advantage': 1, 'username': 'G0' },
            ],
            [
                { 'token': '10aD1', 'advantage': 0, 'username': 'H0' },
            ],
            [
                { 'token': '10aE0', 'advantage': 1, 'username': 'I0' },
            ],
            [
                { 'token': '10aE1', 'advantage': 0, 'username': 'J0' },
            ],
            [
                { 'token': '10aF0', 'advantage': 1, 'username': 'K0' },
            ],
            [
                { 'token': '10aF1', 'advantage': 0, 'username': 'L0' },
            ],
            [
                { 'token': '10aG0', 'advantage': 1, 'username': 'M0' },
            ],
            [
                { 'token': '10aG1', 'advantage': 0, 'username': 'N0' },
            ],
            [
                { 'token': '10aH0', 'advantage': 1, 'username': 'O0' },
            ],
            [
                { 'token': '10aH1', 'advantage': 0, 'username': 'P0' },
            ],
        ];
        let tournament = helperFunctions_spec_1.TestHelperFunctions.buildTournament(stages, true);
        expect(helperFunctions_spec_1.TestHelperFunctions.checkUpdateNextStageResult(tournament, 0, result)).toBeTruthy();
    });
    it('should update next stage correctly for grp16->se16', () => {
        let stages = [
            {
                nrGroups: 16,
                nrParticipants: 32,
                stageType: 'GROUP',
                legs: 1,
                nrLocations: 1,
                thirdPlaceMatch: true
            },
            {
                nrGroups: 16,
                nrParticipants: 32,
                stageType: 'SINGLE_ELIMINATION',
                legs: 1,
                nrLocations: 1,
                thirdPlaceMatch: true
            }
        ];
        let result = [
            [
                { 'token': '10aA0', 'advantage': 1, 'username': 'A0' },
                { 'token': '10aI1', 'advantage': 0, 'username': 'A1' },
            ],
            [
                { 'token': '10aI0', 'advantage': 1, 'username': 'B0' },
                { 'token': '10aA1', 'advantage': 0, 'username': 'B1' },
            ],
            [
                { 'token': '10aB0', 'advantage': 1, 'username': 'C0' },
                { 'token': '10aJ1', 'advantage': 0, 'username': 'C1' },
            ],
            [
                { 'token': '10aJ0', 'advantage': 1, 'username': 'D0' },
                { 'token': '10aB1', 'advantage': 0, 'username': 'D1' },
            ],
            [
                { 'token': '10aC0', 'advantage': 1, 'username': 'E0' },
                { 'token': '10aK1', 'advantage': 0, 'username': 'E1' },
            ],
            [
                { 'token': '10aK0', 'advantage': 1, 'username': 'F0' },
                { 'token': '10aC1', 'advantage': 0, 'username': 'F1' },
            ],
            [
                { 'token': '10aD0', 'advantage': 1, 'username': 'G0' },
                { 'token': '10aL1', 'advantage': 0, 'username': 'G1' },
            ],
            [
                { 'token': '10aL0', 'advantage': 1, 'username': 'H0' },
                { 'token': '10aD1', 'advantage': 0, 'username': 'H1' },
            ],
            [
                { 'token': '10aE0', 'advantage': 1, 'username': 'I0' },
                { 'token': '10aM1', 'advantage': 0, 'username': 'I1' },
            ],
            [
                { 'token': '10aM0', 'advantage': 1, 'username': 'J0' },
                { 'token': '10aE1', 'advantage': 0, 'username': 'J1' },
            ],
            [
                { 'token': '10aF0', 'advantage': 1, 'username': 'K0' },
                { 'token': '10aN1', 'advantage': 0, 'username': 'K1' },
            ],
            [
                { 'token': '10aN0', 'advantage': 1, 'username': 'L0' },
                { 'token': '10aF1', 'advantage': 0, 'username': 'L1' },
            ],
            [
                { 'token': '10aG0', 'advantage': 1, 'username': 'M0' },
                { 'token': '10aO1', 'advantage': 0, 'username': 'M1' },
            ],
            [
                { 'token': '10aO0', 'advantage': 1, 'username': 'N0' },
                { 'token': '10aG1', 'advantage': 0, 'username': 'N1' },
            ],
            [
                { 'token': '10aH0', 'advantage': 1, 'username': 'O0' },
                { 'token': '10aP1', 'advantage': 0, 'username': 'O1' },
            ],
            [
                { 'token': '10aP0', 'advantage': 1, 'username': 'P0' },
                { 'token': '10aH1', 'advantage': 0, 'username': 'P1' },
            ],
        ];
        let tournament = helperFunctions_spec_1.TestHelperFunctions.buildTournament(stages, true);
        expect(helperFunctions_spec_1.TestHelperFunctions.checkUpdateNextStageResult(tournament, 0, result)).toBeTruthy();
    });
    it('should update next stage correctly for grp16->se32', () => {
        let stages = [
            {
                nrGroups: 16,
                nrParticipants: 64,
                stageType: 'GROUP',
                legs: 1,
                nrLocations: 1,
                thirdPlaceMatch: true
            },
            {
                nrGroups: 32,
                nrParticipants: 64,
                stageType: 'SINGLE_ELIMINATION',
                legs: 1,
                nrLocations: 1,
                thirdPlaceMatch: true
            }
        ];
        let result = [
            [
                { 'token': '10aA0', 'advantage': 1, 'username': 'A0' },
                { 'token': '10aR0', 'advantage': 1, 'username': 'A1' },
                { 'token': '10aZ1', 'advantage': 0, 'username': 'A2' },
                { 'token': '10aI1', 'advantage': 0, 'username': 'A3' },
            ],
            [
                { 'token': '10aI0', 'advantage': 1, 'username': 'B0' },
                { 'token': '10aZ0', 'advantage': 1, 'username': 'B1' },
                { 'token': '10aR1', 'advantage': 0, 'username': 'B2' },
                { 'token': '10aA1', 'advantage': 0, 'username': 'B3' },
            ],
            [
                { 'token': '10aQ0', 'advantage': 1, 'username': 'C0' },
                { 'token': '10aB0', 'advantage': 1, 'username': 'C1' },
                { 'token': '10aJ1', 'advantage': 0, 'username': 'C2' },
                { 'token': '10aY1', 'advantage': 0, 'username': 'C3' },
            ],
            [
                { 'token': '10aY0', 'advantage': 1, 'username': 'D0' },
                { 'token': '10aJ0', 'advantage': 1, 'username': 'D1' },
                { 'token': '10aB1', 'advantage': 0, 'username': 'D2' },
                { 'token': '10aQ1', 'advantage': 0, 'username': 'D3' },
            ],
            [
                { 'token': '10aC0', 'advantage': 1, 'username': 'E0' },
                { 'token': '10aT0', 'advantage': 1, 'username': 'E1' },
                { 'token': '10bB1', 'advantage': 0, 'username': 'E2' },
                { 'token': '10aK1', 'advantage': 0, 'username': 'E3' },
            ],
            [
                { 'token': '10aK0', 'advantage': 1, 'username': 'F0' },
                { 'token': '10bB0', 'advantage': 1, 'username': 'F1' },
                { 'token': '10aT1', 'advantage': 0, 'username': 'F2' },
                { 'token': '10aC1', 'advantage': 0, 'username': 'F3' },
            ],
            [
                { 'token': '10aS0', 'advantage': 1, 'username': 'G0' },
                { 'token': '10aD0', 'advantage': 1, 'username': 'G1' },
                { 'token': '10aL1', 'advantage': 0, 'username': 'G2' },
                { 'token': '10bA1', 'advantage': 0, 'username': 'G3' },
            ],
            [
                { 'token': '10bA0', 'advantage': 1, 'username': 'H0' },
                { 'token': '10aL0', 'advantage': 1, 'username': 'H1' },
                { 'token': '10aD1', 'advantage': 0, 'username': 'H2' },
                { 'token': '10aS1', 'advantage': 0, 'username': 'H3' },
            ],
            [
                { 'token': '10aE0', 'advantage': 1, 'username': 'I0' },
                { 'token': '10aV0', 'advantage': 1, 'username': 'I1' },
                { 'token': '10bD1', 'advantage': 0, 'username': 'I2' },
                { 'token': '10aM1', 'advantage': 0, 'username': 'I3' },
            ],
            [
                { 'token': '10aM0', 'advantage': 1, 'username': 'J0' },
                { 'token': '10bD0', 'advantage': 1, 'username': 'J1' },
                { 'token': '10aV1', 'advantage': 0, 'username': 'J2' },
                { 'token': '10aE1', 'advantage': 0, 'username': 'J3' },
            ],
            [
                { 'token': '10aU0', 'advantage': 1, 'username': 'K0' },
                { 'token': '10aF0', 'advantage': 1, 'username': 'K1' },
                { 'token': '10aN1', 'advantage': 0, 'username': 'K2' },
                { 'token': '10bC1', 'advantage': 0, 'username': 'K3' },
            ],
            [
                { 'token': '10bC0', 'advantage': 1, 'username': 'L0' },
                { 'token': '10aN0', 'advantage': 1, 'username': 'L1' },
                { 'token': '10aF1', 'advantage': 0, 'username': 'L2' },
                { 'token': '10aU1', 'advantage': 0, 'username': 'L3' },
            ],
            [
                { 'token': '10aG0', 'advantage': 1, 'username': 'M0' },
                { 'token': '10aX0', 'advantage': 1, 'username': 'M1' },
                { 'token': '10bF1', 'advantage': 0, 'username': 'M2' },
                { 'token': '10aO1', 'advantage': 0, 'username': 'M3' },
            ],
            [
                { 'token': '10aO0', 'advantage': 1, 'username': 'N0' },
                { 'token': '10bF0', 'advantage': 1, 'username': 'N1' },
                { 'token': '10aX1', 'advantage': 0, 'username': 'N2' },
                { 'token': '10aG1', 'advantage': 0, 'username': 'N3' },
            ],
            [
                { 'token': '10aW0', 'advantage': 1, 'username': 'O0' },
                { 'token': '10aH0', 'advantage': 1, 'username': 'O1' },
                { 'token': '10aP1', 'advantage': 0, 'username': 'O2' },
                { 'token': '10bE1', 'advantage': 0, 'username': 'O3' },
            ],
            [
                { 'token': '10bE0', 'advantage': 1, 'username': 'P0' },
                { 'token': '10aP0', 'advantage': 1, 'username': 'P1' },
                { 'token': '10aH1', 'advantage': 0, 'username': 'P2' },
                { 'token': '10aW1', 'advantage': 0, 'username': 'P3' },
            ],
        ];
        let tournament = helperFunctions_spec_1.TestHelperFunctions.buildTournament(stages, true);
        expect(helperFunctions_spec_1.TestHelperFunctions.checkUpdateNextStageResult(tournament, 0, result)).toBeTruthy();
    });
    it('should update next stage correctly for grp16->se64', () => {
        let stages = [
            {
                nrGroups: 16,
                nrParticipants: 128,
                stageType: 'GROUP',
                legs: 1,
                nrLocations: 1,
                thirdPlaceMatch: true
            },
            {
                nrGroups: 64,
                nrParticipants: 128,
                stageType: 'SINGLE_ELIMINATION',
                legs: 1,
                nrLocations: 1,
                thirdPlaceMatch: true
            }
        ];
        let result = [
            [
                { 'token': '10aA0', 'advantage': 1, 'username': 'A0' },
                { 'token': '10bI0', 'advantage': 1, 'username': 'A1' },
                { 'token': '10cL0', 'advantage': 1, 'username': 'A2' },
                { 'token': '10bD0', 'advantage': 1, 'username': 'A3' },
                { 'token': '10aV1', 'advantage': 0, 'username': 'A4' },
                { 'token': '10cD1', 'advantage': 0, 'username': 'A5' },
                { 'token': '10bQ1', 'advantage': 0, 'username': 'A6' },
                { 'token': '10aI1', 'advantage': 0, 'username': 'A7' },
            ],
            [
                { 'token': '10aI0', 'advantage': 1, 'username': 'B0' },
                { 'token': '10bQ0', 'advantage': 1, 'username': 'B1' },
                { 'token': '10cD0', 'advantage': 1, 'username': 'B2' },
                { 'token': '10aV0', 'advantage': 1, 'username': 'B3' },
                { 'token': '10bD1', 'advantage': 0, 'username': 'B4' },
                { 'token': '10cL1', 'advantage': 0, 'username': 'B5' },
                { 'token': '10bI1', 'advantage': 0, 'username': 'B6' },
                { 'token': '10aA1', 'advantage': 0, 'username': 'B7' },
            ],
            [
                { 'token': '10aQ0', 'advantage': 1, 'username': 'C0' },
                { 'token': '10bY0', 'advantage': 1, 'username': 'C1' },
                { 'token': '10bV0', 'advantage': 1, 'username': 'C2' },
                { 'token': '10aN0', 'advantage': 1, 'username': 'C3' },
                { 'token': '10aF1', 'advantage': 0, 'username': 'C4' },
                { 'token': '10bN1', 'advantage': 0, 'username': 'C5' },
                { 'token': '10cG1', 'advantage': 0, 'username': 'C6' },
                { 'token': '10aY1', 'advantage': 0, 'username': 'C7' },
            ],
            [
                { 'token': '10aY0', 'advantage': 1, 'username': 'D0' },
                { 'token': '10cG0', 'advantage': 1, 'username': 'D1' },
                { 'token': '10bN0', 'advantage': 1, 'username': 'D2' },
                { 'token': '10aF0', 'advantage': 1, 'username': 'D3' },
                { 'token': '10aN1', 'advantage': 0, 'username': 'D4' },
                { 'token': '10bV1', 'advantage': 0, 'username': 'D5' },
                { 'token': '10bY1', 'advantage': 0, 'username': 'D6' },
                { 'token': '10aQ1', 'advantage': 0, 'username': 'D7' },
            ],
            [
                { 'token': '10bG0', 'advantage': 1, 'username': 'E0' },
                { 'token': '10aC0', 'advantage': 1, 'username': 'E1' },
                { 'token': '10bF0', 'advantage': 1, 'username': 'E2' },
                { 'token': '10cJ0', 'advantage': 1, 'username': 'E3' },
                { 'token': '10cB1', 'advantage': 0, 'username': 'E4' },
                { 'token': '10aX1', 'advantage': 0, 'username': 'E5' },
                { 'token': '10aK1', 'advantage': 0, 'username': 'E6' },
                { 'token': '10bO1', 'advantage': 0, 'username': 'E7' },
            ],
            [
                { 'token': '10bO0', 'advantage': 1, 'username': 'F0' },
                { 'token': '10aK0', 'advantage': 1, 'username': 'F1' },
                { 'token': '10aX0', 'advantage': 1, 'username': 'F2' },
                { 'token': '10cB0', 'advantage': 1, 'username': 'F3' },
                { 'token': '10cJ1', 'advantage': 0, 'username': 'F4' },
                { 'token': '10bF1', 'advantage': 0, 'username': 'F5' },
                { 'token': '10aC1', 'advantage': 0, 'username': 'F6' },
                { 'token': '10bG1', 'advantage': 0, 'username': 'F7' },
            ],
            [
                { 'token': '10bW0', 'advantage': 1, 'username': 'G0' },
                { 'token': '10aS0', 'advantage': 1, 'username': 'G1' },
                { 'token': '10aP0', 'advantage': 1, 'username': 'G2' },
                { 'token': '10bT0', 'advantage': 1, 'username': 'G3' },
                { 'token': '10bL1', 'advantage': 0, 'username': 'G4' },
                { 'token': '10aH1', 'advantage': 0, 'username': 'G5' },
                { 'token': '10bA1', 'advantage': 0, 'username': 'G6' },
                { 'token': '10cE1', 'advantage': 0, 'username': 'G7' },
            ],
            [
                { 'token': '10cE0', 'advantage': 1, 'username': 'H0' },
                { 'token': '10bA0', 'advantage': 1, 'username': 'H1' },
                { 'token': '10aH0', 'advantage': 1, 'username': 'H2' },
                { 'token': '10bL0', 'advantage': 1, 'username': 'H3' },
                { 'token': '10bT1', 'advantage': 0, 'username': 'H4' },
                { 'token': '10aP1', 'advantage': 0, 'username': 'H5' },
                { 'token': '10aS1', 'advantage': 0, 'username': 'H6' },
                { 'token': '10bW1', 'advantage': 0, 'username': 'H7' },
            ],
            [
                { 'token': '10aE0', 'advantage': 1, 'username': 'I0' },
                { 'token': '10bM0', 'advantage': 1, 'username': 'I1' },
                { 'token': '10cH0', 'advantage': 1, 'username': 'I2' },
                { 'token': '10aZ0', 'advantage': 1, 'username': 'I3' },
                { 'token': '10aR1', 'advantage': 0, 'username': 'I4' },
                { 'token': '10bZ1', 'advantage': 0, 'username': 'I5' },
                { 'token': '10bU1', 'advantage': 0, 'username': 'I6' },
                { 'token': '10aM1', 'advantage': 0, 'username': 'I7' },
            ],
            [
                { 'token': '10aM0', 'advantage': 1, 'username': 'J0' },
                { 'token': '10bU0', 'advantage': 1, 'username': 'J1' },
                { 'token': '10bZ0', 'advantage': 1, 'username': 'J2' },
                { 'token': '10aR0', 'advantage': 1, 'username': 'J3' },
                { 'token': '10aZ1', 'advantage': 0, 'username': 'J4' },
                { 'token': '10cH1', 'advantage': 0, 'username': 'J5' },
                { 'token': '10bM1', 'advantage': 0, 'username': 'J6' },
                { 'token': '10aE1', 'advantage': 0, 'username': 'J7' },
            ],
            [
                { 'token': '10aU0', 'advantage': 1, 'username': 'K0' },
                { 'token': '10cC0', 'advantage': 1, 'username': 'K1' },
                { 'token': '10bR0', 'advantage': 1, 'username': 'K2' },
                { 'token': '10aJ0', 'advantage': 1, 'username': 'K3' },
                { 'token': '10aB1', 'advantage': 0, 'username': 'K4' },
                { 'token': '10bJ1', 'advantage': 0, 'username': 'K5' },
                { 'token': '10cK1', 'advantage': 0, 'username': 'K6' },
                { 'token': '10bC1', 'advantage': 0, 'username': 'K7' },
            ],
            [
                { 'token': '10bC0', 'advantage': 1, 'username': 'L0' },
                { 'token': '10cK0', 'advantage': 1, 'username': 'L1' },
                { 'token': '10bJ0', 'advantage': 1, 'username': 'L2' },
                { 'token': '10aB0', 'advantage': 1, 'username': 'L3' },
                { 'token': '10aJ1', 'advantage': 0, 'username': 'L4' },
                { 'token': '10bR1', 'advantage': 0, 'username': 'L5' },
                { 'token': '10cC1', 'advantage': 0, 'username': 'L6' },
                { 'token': '10aU1', 'advantage': 0, 'username': 'L7' },
            ],
            [
                { 'token': '10bK0', 'advantage': 1, 'username': 'M0' },
                { 'token': '10aG0', 'advantage': 1, 'username': 'M1' },
                { 'token': '10bB0', 'advantage': 1, 'username': 'M2' },
                { 'token': '10cF0', 'advantage': 1, 'username': 'M3' },
                { 'token': '10bX1', 'advantage': 0, 'username': 'M4' },
                { 'token': '10aT1', 'advantage': 0, 'username': 'M5' },
                { 'token': '10aO1', 'advantage': 0, 'username': 'M6' },
                { 'token': '10bS1', 'advantage': 0, 'username': 'M7' },
            ],
            [
                { 'token': '10bS0', 'advantage': 1, 'username': 'N0' },
                { 'token': '10aO0', 'advantage': 1, 'username': 'N1' },
                { 'token': '10aT0', 'advantage': 1, 'username': 'N2' },
                { 'token': '10bX0', 'advantage': 1, 'username': 'N3' },
                { 'token': '10cF1', 'advantage': 0, 'username': 'N4' },
                { 'token': '10bB1', 'advantage': 0, 'username': 'N5' },
                { 'token': '10aG1', 'advantage': 0, 'username': 'N6' },
                { 'token': '10bK1', 'advantage': 0, 'username': 'N7' },
            ],
            [
                { 'token': '10cA0', 'advantage': 1, 'username': 'O0' },
                { 'token': '10aW0', 'advantage': 1, 'username': 'O1' },
                { 'token': '10aL0', 'advantage': 1, 'username': 'O2' },
                { 'token': '10bP0', 'advantage': 1, 'username': 'O3' },
                { 'token': '10bH1', 'advantage': 0, 'username': 'O4' },
                { 'token': '10aD1', 'advantage': 0, 'username': 'O5' },
                { 'token': '10bE1', 'advantage': 0, 'username': 'O6' },
                { 'token': '10cI1', 'advantage': 0, 'username': 'O7' },
            ],
            [
                { 'token': '10cI0', 'advantage': 1, 'username': 'P0' },
                { 'token': '10bE0', 'advantage': 1, 'username': 'P1' },
                { 'token': '10aD0', 'advantage': 1, 'username': 'P2' },
                { 'token': '10bH0', 'advantage': 1, 'username': 'P3' },
                { 'token': '10bP1', 'advantage': 0, 'username': 'P4' },
                { 'token': '10aL1', 'advantage': 0, 'username': 'P5' },
                { 'token': '10aW1', 'advantage': 0, 'username': 'P6' },
                { 'token': '10cA1', 'advantage': 0, 'username': 'P7' },
            ],
        ];
        let tournament = helperFunctions_spec_1.TestHelperFunctions.buildTournament(stages, true);
        expect(helperFunctions_spec_1.TestHelperFunctions.checkUpdateNextStageResult(tournament, 0, result)).toBeTruthy();
    });
});
describe('updateNextStage se->se', () => {
    it('should update next phase correctly for grp2->grp4', () => {
        let stages = [
            {
                nrGroups: 2,
                nrParticipants: 4,
                stageType: 'SINGLE_ELIMINATION',
                legs: 1,
                nrLocations: 1,
                thirdPlaceMatch: true
            }
        ];
        let result = [
            [
                { 'token': '01aA0', 'advantage': 1, 'username': 'A0' }
            ],
            [
                { 'token': '01aA1', 'advantage': 0, 'username': 'B0' }
            ]
        ];
        let tournament = helperFunctions_spec_1.TestHelperFunctions.buildTournament(stages, true);
        expect(helperFunctions_spec_1.TestHelperFunctions.checkUpdateNextStageResult(tournament, 0, result)).toBeTruthy();
    });
    it('should update next phase correctly for grp4->grp2', () => {
        let stages = [
            {
                nrGroups: 4,
                nrParticipants: 8,
                stageType: 'SINGLE_ELIMINATION',
                legs: 1,
                nrLocations: 1,
                thirdPlaceMatch: true
            }
        ];
        let result = [
            [
                { 'token': '01aA0', 'advantage': 1, 'username': 'A0' }
            ],
            [
                { 'token': '01aA1', 'advantage': 0, 'username': 'B0' }
            ],
            [
                { 'token': '01aB0', 'advantage': 1, 'username': 'C0' }
            ],
            [
                { 'token': '01aB1', 'advantage': 0, 'username': 'D0' }
            ]
        ];
        let tournament = helperFunctions_spec_1.TestHelperFunctions.buildTournament(stages, true);
        expect(helperFunctions_spec_1.TestHelperFunctions.checkUpdateNextStageResult(tournament, 0, result)).toBeTruthy();
    });
    it('should update next phase correctly with 2 legs for grp4->grp2', () => {
        let stages = [
            {
                nrGroups: 4,
                nrParticipants: 8,
                stageType: 'SINGLE_ELIMINATION',
                legs: 2,
                nrLocations: 1,
                thirdPlaceMatch: true
            }
        ];
        let result = [
            [
                { 'token': '01aA0', 'advantage': 1, 'username': 'A0' },
                { 'token': '01aA0', 'advantage': 0, 'username': 'A0' }
            ],
            [
                { 'token': '01aA1', 'advantage': 0, 'username': 'B0' },
                { 'token': '01aA1', 'advantage': 1, 'username': 'B0' }
            ],
            [
                { 'token': '01aB0', 'advantage': 1, 'username': 'C0' },
                { 'token': '01aB0', 'advantage': 0, 'username': 'C0' }
            ],
            [
                { 'token': '01aB1', 'advantage': 0, 'username': 'D0' },
                { 'token': '01aB1', 'advantage': 1, 'username': 'D0' }
            ]
        ];
        let tournament = helperFunctions_spec_1.TestHelperFunctions.buildTournament(stages, true);
        expect(helperFunctions_spec_1.TestHelperFunctions.checkUpdateNextStageResult(tournament, 0, result)).toBeTruthy();
    });
    it('should update next phase correctly with 3 legs for grp8->grp4', () => {
        let stages = [
            {
                nrGroups: 8,
                nrParticipants: 16,
                stageType: 'SINGLE_ELIMINATION',
                legs: 3,
                nrLocations: 1,
                thirdPlaceMatch: true
            }
        ];
        let result = [
            [
                { 'token': '01aA0', 'advantage': 1, 'username': 'A0' },
                { 'token': '01aA0', 'advantage': 0, 'username': 'A0' },
                { 'token': '01aA0', 'advantage': 1, 'username': 'A0' }
            ],
            [
                { 'token': '01aA1', 'advantage': 0, 'username': 'B0' },
                { 'token': '01aA1', 'advantage': 1, 'username': 'B0' },
                { 'token': '01aA1', 'advantage': 0, 'username': 'B0' }
            ],
            [
                { 'token': '01aB0', 'advantage': 1, 'username': 'C0' },
                { 'token': '01aB0', 'advantage': 0, 'username': 'C0' },
                { 'token': '01aB0', 'advantage': 1, 'username': 'C0' }
            ],
            [
                { 'token': '01aB1', 'advantage': 0, 'username': 'D0' },
                { 'token': '01aB1', 'advantage': 1, 'username': 'D0' },
                { 'token': '01aB1', 'advantage': 0, 'username': 'D0' }
            ],
            [
                { 'token': '01aC0', 'advantage': 1, 'username': 'E0' },
                { 'token': '01aC0', 'advantage': 0, 'username': 'E0' },
                { 'token': '01aC0', 'advantage': 1, 'username': 'E0' }
            ],
            [
                { 'token': '01aC1', 'advantage': 0, 'username': 'F0' },
                { 'token': '01aC1', 'advantage': 1, 'username': 'F0' },
                { 'token': '01aC1', 'advantage': 0, 'username': 'F0' }
            ],
            [
                { 'token': '01aD0', 'advantage': 1, 'username': 'G0' },
                { 'token': '01aD0', 'advantage': 0, 'username': 'G0' },
                { 'token': '01aD0', 'advantage': 1, 'username': 'G0' }
            ],
            [
                { 'token': '01aD1', 'advantage': 0, 'username': 'H0' },
                { 'token': '01aD1', 'advantage': 1, 'username': 'H0' },
                { 'token': '01aD1', 'advantage': 0, 'username': 'H0' }
            ]
        ];
        let tournament = helperFunctions_spec_1.TestHelperFunctions.buildTournament(stages, true);
        expect(helperFunctions_spec_1.TestHelperFunctions.checkUpdateNextStageResult(tournament, 0, result)).toBeTruthy();
    });
    it('should update next phase correctly with 7 participants for grp4->grp2', () => {
        let stages = [
            {
                nrGroups: 4,
                nrParticipants: 7,
                stageType: 'SINGLE_ELIMINATION',
                legs: 1,
                nrLocations: 1,
                thirdPlaceMatch: true
            }
        ];
        let result = [
            [
                { 'token': '01aA0', 'advantage': 1, 'username': 'A0' }
            ],
            [
                { 'token': '01aA1', 'advantage': 0, 'username': 'B0' }
            ],
            [
                { 'token': '01aB0', 'advantage': 1, 'username': 'C0' }
            ],
            [
                { 'token': '01aB1', 'advantage': 0, 'username': 'D0' }
            ]
        ];
        let tournament = helperFunctions_spec_1.TestHelperFunctions.buildTournament(stages, true);
        expect(helperFunctions_spec_1.TestHelperFunctions.checkUpdateNextStageResult(tournament, 0, result)).toBeTruthy();
    });
    it('should update next phase correctly with 6 participants for grp4->grp2', () => {
        let stages = [
            {
                nrGroups: 4,
                nrParticipants: 6,
                stageType: 'SINGLE_ELIMINATION',
                legs: 1,
                nrLocations: 1,
                thirdPlaceMatch: true
            }
        ];
        let result = [
            [
                { 'token': '01aA0', 'advantage': 1, 'username': 'A0' }
            ],
            [
                { 'token': '01aA1', 'advantage': 0, 'username': 'B0' }
            ],
            [
                { 'token': '01aB0', 'advantage': 1, 'username': 'C0' }
            ],
            [
                { 'token': '01aB1', 'advantage': 0, 'username': MatchFactory_1.MatchFactory.EMPTY_ENTRY.token }
            ]
        ];
        let tournament = helperFunctions_spec_1.TestHelperFunctions.buildTournament(stages, true);
        expect(helperFunctions_spec_1.TestHelperFunctions.checkUpdateNextStageResult(tournament, 0, result)).toBeTruthy();
    });
    it('should update a full single elimination tournament correctly with nrGroup=4', () => {
        let stages = [
            {
                nrGroups: 4,
                nrParticipants: 8,
                stageType: 'SINGLE_ELIMINATION',
                legs: 1,
                nrLocations: 1,
                thirdPlaceMatch: false
            }
        ];
        let result = [
            [
                [
                    { 'token': '01aA0', 'advantage': 1, 'username': 'A0' }
                ],
                [
                    { 'token': '01aA1', 'advantage': 0, 'username': 'B0' }
                ],
                [
                    { 'token': '01aB0', 'advantage': 1, 'username': 'C0' }
                ],
                [
                    { 'token': '01aB1', 'advantage': 0, 'username': 'D0' }
                ]
            ],
            [
                [
                    { 'token': '02aA0', 'advantage': 1, 'username': 'A0' }
                ],
                [
                    { 'token': '02aA1', 'advantage': 0, 'username': 'B0' }
                ]
            ]
        ];
        let tournament = helperFunctions_spec_1.TestHelperFunctions.buildTournament(stages, true);
        let check = true;
        let maxPhase = Math.max.apply(Math, tournament.stageConfigs[0].matches.map(match => match.phase));
        for (let phase = 0; phase < maxPhase; phase++) {
            check = helperFunctions_spec_1.TestHelperFunctions.checkUpdateNextStageResult(tournament, phase, result[phase]);
            if (!check)
                break;
        }
        expect(check).toBeTruthy();
    });
    it('should update a full single elimination tournament correctly with nrGroup=8', () => {
        let stages = [
            {
                nrGroups: 8,
                nrParticipants: 16,
                stageType: 'SINGLE_ELIMINATION',
                legs: 1,
                nrLocations: 1,
                thirdPlaceMatch: false
            }
        ];
        let result = [
            [
                [
                    { 'token': '01aA0', 'advantage': 1, 'username': 'A0' }
                ],
                [
                    { 'token': '01aA1', 'advantage': 0, 'username': 'B0' }
                ],
                [
                    { 'token': '01aB0', 'advantage': 1, 'username': 'C0' }
                ],
                [
                    { 'token': '01aB1', 'advantage': 0, 'username': 'D0' }
                ],
                [
                    { 'token': '01aC0', 'advantage': 1, 'username': 'E0' }
                ],
                [
                    { 'token': '01aC1', 'advantage': 0, 'username': 'F0' }
                ],
                [
                    { 'token': '01aD0', 'advantage': 1, 'username': 'G0' }
                ],
                [
                    { 'token': '01aD1', 'advantage': 0, 'username': 'H0' }
                ]
            ],
            [
                [
                    { 'token': '02aA0', 'advantage': 1, 'username': 'A0' }
                ],
                [
                    { 'token': '02aA1', 'advantage': 0, 'username': 'B0' }
                ],
                [
                    { 'token': '02aB0', 'advantage': 1, 'username': 'C0' }
                ],
                [
                    { 'token': '02aB1', 'advantage': 0, 'username': 'D0' }
                ]
            ],
            [
                [
                    { 'token': '03aA0', 'advantage': 1, 'username': 'A0' }
                ],
                [
                    { 'token': '03aA1', 'advantage': 0, 'username': 'B0' }
                ]
            ]
        ];
        let tournament = helperFunctions_spec_1.TestHelperFunctions.buildTournament(stages, true);
        let check = true;
        let maxPhase = Math.max.apply(Math, tournament.stageConfigs[0].matches.map(match => match.phase));
        for (let phase = 0; phase < maxPhase; phase++) {
            check = helperFunctions_spec_1.TestHelperFunctions.checkUpdateNextStageResult(tournament, phase, result[phase]);
            if (!check)
                break;
        }
        expect(check).toBeTruthy();
    });
    it('should update a full single elimination tournament correctly with nrGroup=8 and thirdPlaceMatch', () => {
        let stages = [
            {
                nrGroups: 8,
                nrParticipants: 16,
                stageType: 'SINGLE_ELIMINATION',
                legs: 1,
                nrLocations: 1,
                thirdPlaceMatch: true
            }
        ];
        let result = [
            [
                [
                    { 'token': '01aA0', 'advantage': 1, 'username': 'A0' }
                ],
                [
                    { 'token': '01aA1', 'advantage': 0, 'username': 'B0' }
                ],
                [
                    { 'token': '01aB0', 'advantage': 1, 'username': 'C0' }
                ],
                [
                    { 'token': '01aB1', 'advantage': 0, 'username': 'D0' }
                ],
                [
                    { 'token': '01aC0', 'advantage': 1, 'username': 'E0' }
                ],
                [
                    { 'token': '01aC1', 'advantage': 0, 'username': 'F0' }
                ],
                [
                    { 'token': '01aD0', 'advantage': 1, 'username': 'G0' }
                ],
                [
                    { 'token': '01aD1', 'advantage': 0, 'username': 'H0' }
                ]
            ],
            [
                [
                    { 'token': '02aA0', 'advantage': 1, 'username': 'A0' }
                ],
                [
                    { 'token': '02aA1', 'advantage': 0, 'username': 'B0' }
                ],
                [
                    { 'token': '02aB0', 'advantage': 1, 'username': 'C0' }
                ],
                [
                    { 'token': '02aB1', 'advantage': 0, 'username': 'D0' }
                ]
            ],
            [
                [
                    { 'token': '03aA0', 'advantage': 1, 'username': 'A0' },
                    { 'token': '04aA0', 'advantage': 1, 'username': 'A1' }
                ],
                [
                    { 'token': '03aA1', 'advantage': 0, 'username': 'B0' },
                    { 'token': '04aA1', 'advantage': 0, 'username': 'B1' }
                ]
            ],
            []
        ];
        let tournament = helperFunctions_spec_1.TestHelperFunctions.buildTournament(stages, true);
        let check = true;
        let maxPhase = Math.max.apply(Math, tournament.stageConfigs[0].matches.map(match => match.phase));
        for (let phase = 0; phase < maxPhase; phase++) {
            check = helperFunctions_spec_1.TestHelperFunctions.checkUpdateNextStageResult(tournament, phase, result[phase]);
            if (!check)
                break;
        }
        expect(check).toBeTruthy();
    });
});
//# sourceMappingURL=updateNextStage.spec.js.map