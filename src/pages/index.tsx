import TopNav from "@/components/TopNav";
import React, { useEffect, useState } from "react";
import { Button, createTheme, Typography } from "@mui/material";
import ResultCard from "@/components/ResultCard";
import HotTakeCard from "@/components/HotTakeCard";
import EloRank from "elo-rank";

import { collection, getDocs } from "firebase/firestore";
import { db } from "../lib/firebase";

export default function Home() {

    const [leftID, setLeftID] = useState('');

    const [leftTake, setLeftTake] = useState('Default Value Left');
    const [rightTake, setRightTake] = useState('Default Value Right');

    const [winner, setWinner] = useState(-1);

    const [playerOneDiff, setPlayerOneDiff] = useState(0);
    const [playerTwoDiff, setPlayerTwoDiff] = useState(0);

    const [playerOneRating, setPlayerOneRating] = useState(1000);
    const [playerTwoRating, setPlayerTwoRating] = useState(1000);
    

    function calculateNewRatings(win:any) {
        const elo = new EloRank(32);

        const expectedOne = elo.getExpected(playerOneRating, playerTwoRating);
        const expectedTwo = elo.getExpected(playerTwoRating, playerOneRating);

        let newRatingOne = 0;
        let newRatingTwo = 0;

        if (win === 1) {
            newRatingOne = elo.updateRating(expectedOne, 1, playerOneRating);
            newRatingTwo = elo.updateRating(expectedTwo, 0, playerTwoRating);
        } else {
            newRatingOne = elo.updateRating(expectedOne, 0, playerOneRating);
            newRatingTwo = elo.updateRating(expectedTwo, 1, playerTwoRating);
        }

        setPlayerOneDiff(newRatingOne - playerOneRating);
        setPlayerTwoDiff(newRatingTwo - playerTwoRating);

        setPlayerOneRating(newRatingOne);
        setPlayerTwoRating(newRatingTwo);
    };

    async function getTakes() {
        const querySnapshot = await getDocs(collection(db, "Takes"));
        const takes = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        }));
        let firstIndex = Math.floor(Math.random() * takes.length);
        let firstSelection = takes[firstIndex];

        let secondIndex = Math.floor(Math.random() * takes.length);
        while (firstIndex == secondIndex) {
            secondIndex = Math.floor(Math.random() * takes.length);
        }
        let secondSelection = takes[secondIndex];

        setLeftTake(firstSelection.content);
        setRightTake(secondSelection.content);

        setPlayerOneRating(firstSelection.elo);
        setPlayerTwoRating(secondSelection.elo);

        
    }

    function handleLeft() {
        setWinner(1);
        console.log('clicked left!');
        console.log(`Old: ${playerOneRating}(${playerOneDiff}) | ${playerTwoRating}(${playerTwoDiff})`);
        calculateNewRatings(1);
    }

    function handleRight() {
        setWinner(2);
        console.log('clicked right!');
        console.log(`Old: ${playerOneRating}(${playerOneDiff}) | ${playerTwoRating}(${playerTwoDiff})`);
        calculateNewRatings(2);
    }

    function handleTie() {
        if (winner == -1) {
            setWinner(0);
            setPlayerOneDiff(0);
            setPlayerTwoDiff(0);
        } else {
            setWinner(-1);
        }
    }

    useEffect(() => {
        getTakes();
    }, []);


    return (
        <React.Fragment>
            <TopNav />
            <div className="flex justify-center m-[25px] md:m-[50px]">
                <div>
                    <Typography sx={{ typography: { xs: 'h3', lg: 'h1' } }} style={{ fontWeight: 700 }} className="text-center ">Rank The People's Hottest Takes</Typography>
                    <Typography sx={{ typography: { xs: 'h4', lg: 'h2' } }} style={{ fontWeight: 700 }} className="text-center ">Which one's the Hottest?</Typography>
                </div>
            </div>
            <div className="grid grid-cols-12 gap-4 min-h-[500px]">
                {winner < 0 ?
                    <div className="col-span-full md:col-span-4 m-10" onClick={handleLeft}>
                        <HotTakeCard take={leftTake} />
                    </div> :
                    <div className="col-span-full md:col-span-4 m-10">
                        <ResultCard position={1} winner={winner} rating={playerOneRating} diff={playerOneDiff}/>
                    </div>
                }
                <div className="col-span-full md:col-span-4 flex flex-col gap-4 justify-center items-center text-center">
                    <button className="border-2 border-blue-400 rounded-2xl p-10 cursor-pointer transition duration-500 ease-in-out hover:bg-blue-400 text-white font-bold py-2 px-4 rounded-2xl w-[200px]" onClick={handleTie}><Typography variant="h3" style={{ fontWeight: 700 }}>{winner == -1 ? "Tie" : "Next"}</Typography></button>
                </div>
                {winner < 0 ?
                    <div className="col-span-full md:col-span-4 m-10" onClick={handleRight}>
                        <HotTakeCard take={rightTake} />
                    </div> :
                    <div className="col-span-full md:col-span-4 m-10">
                        <ResultCard position={2} winner={winner} rating={playerTwoRating} diff={playerTwoDiff} />
                    </div>
                }
            </div>
        </React.Fragment>
    );
}
//<iframe src="/Hari_Resume.pdf" width="100%" height="100%" />