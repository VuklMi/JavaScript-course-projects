/*
GAME RULES:

- The game has 2 players, playing in rounds
- In each turn, a player rolls a dice as many times as he whishes. Each result get added to his ROUND score
- BUT, if the player rolls a 1, all his ROUND score gets lost. After that, it's the next player's turn
- The player can choose to 'Hold', which means that his ROUND score gets added to his GLBAL score. After that, it's the next player's turn
- The first player to reach 100 points on GLOBAL score wins the game

*/

var scores, roundScore, activePlayer, gamePlaying, previousSix, winningScore;

function init() {
    scores = [0,0];
    roundScore = 0;
    activePlayer = 0; // 0 for player1, 1 for player2
    gamePlaying = false;
    previousSix = false;
    
    // set all initial values on the screen to 0
    document.getElementById('score-0').textContent = '0';
    document.getElementById('score-1').textContent = '0';
    document.getElementById('current-0').textContent = '0';
    document.getElementById('current-1').textContent = '0';
    document.getElementById('name-0').textContent = 'Player 1';
    document.getElementById('name-1').textContent = 'Player 2';
    document.querySelector('.player-0-panel').classList.remove('winner');
    document.querySelector('.player-1-panel').classList.remove('winner');
    document.querySelector('.player-0-panel').classList.remove('active');
    document.querySelector('.player-1-panel').classList.remove('active');
    // must remove active class before adding it, otherwise they could be there twice
    document.querySelector('.player-0-panel').classList.add('active');

    // makes the content of dice classes invisible
    document.querySelector('.dice').style.display = 'none';
    document.querySelector('.dice2').style.display = 'none';
    document.querySelector('.score-submit').style.display = 'block';
}

init();

document.querySelector('.btn-submit').addEventListener('click', function() {
    winningScore = document.getElementById('submitNumber').value;
    document.querySelector('.score-submit').style.display = 'none';
    gamePlaying = true;
});

document.querySelector('.btn-roll').addEventListener('click', function() {
    if(gamePlaying){
        // generates random value in between 1-5
        var dice = Math.floor(Math.random() * 6) +1;
        var dice2 = Math.floor(Math.random() * 6) +1;
        
        // display the result
        var diceDOM = document.querySelector('.dice'); 
        var dice2DOM = document.querySelector('.dice2'); 
        diceDOM.style.display = 'block';
        dice2DOM.style.display = 'block';
        diceDOM.src = 'dice-' + dice + '.png'; // dice-1.png || dice-2.png etcc
        dice2DOM.src = 'dice-' + dice2 + '.png';

        // update the round score if the rolled number was not 1
        if(dice > 1 && dice2 > 1) {
            // add score
            roundScore += dice + dice2;
            // display the score
            document.querySelector('#current-' + activePlayer).textContent = roundScore;
            if((dice === 6 && previousSix) || (dice2 === 6 && previousSix) || (dice === 6 && dice2 === 6)) {
                scores[activePlayer] = 0;
                // update the UI
                document.querySelector('#score-' + activePlayer).textContent = scores[activePlayer];
                switchPlayer();
            }
            else if(dice === 6 || dice2 === 6) {
                previousSix = true;
            }
            else {
                previousSix = false;
            }
        }
        else {
            switchPlayer();
        }
    }
});


document.querySelector('.btn-hold').addEventListener('click', function() {
    if(gamePlaying) {
        // add the current score to the player's global score
        scores[activePlayer] += roundScore;
        // update the UI
        document.querySelector('#score-' + activePlayer).textContent = scores[activePlayer];
        // check if player won the game
        if(scores[activePlayer] >= winningScore) {
            // change player name to winner
            document.getElementById('name-' + activePlayer).textContent = 'winner!';
            // hide the dice
            document.querySelector('.dice').style.display = 'none';
            document.querySelector('.dice2').style.display = 'none';
            // remove red dot showing active player
            document.querySelector('.player-' + activePlayer + '-panel').classList.remove('active');
            // add winner class which styles the winner differently
            document.querySelector('.player-' + activePlayer + '-panel').classList.add('winner');
            gamePlaying = false;
        }
        // switch players
        else {
            switchPlayer();
        }
    }
});

function switchPlayer() {
    // next player
    roundScore = 0;
    previousSix = false;
    document.getElementById('current-' + activePlayer).textContent = '0';
    // remove the red dot from the current active player
    document.querySelector('.player-' + activePlayer + '-panel').classList.remove('active');
    // switch the active players
    activePlayer = activePlayer ? 0 : 1;
    // display the red dot next to the new active player
    document.querySelector('.player-' + activePlayer + '-panel').classList.add('active');
    // hide the dice again for the new round

    //document.querySelector('.dice').style.display = 'none';
}

// start new game after clicking on "new game" button
document.querySelector('.btn-new').addEventListener('click', init);