$(document).ready(function(){
	// Declare global variables
	var win = 0;
	var loss = 0;
	var tie = 0;
	const X = 'X';
	const O = 'O';
	const BLANK = '';
	const MAX_DEPTH = 6;
	var humanVal;
	var aiVal;
	var winningCombos = [
		[0,1,2], // horizontal win on top row
		[3,4,5], // horizontal win on middle row
		[6,7,8], // horizontal win on bottom row
		[0,3,6], // vertical win in left-most column
		[1,4,7], // vertical win in middle column
		[2,5,8], // vertical win in right-most column
		[0,4,8], // diagonal win from top left to bottom right
		[2,4,6]  // diagonal win from bottom left to top right
	];
	var humanFirstTurn = false;
	var easy = false;
	var matchInProgress = false;
	var humansTurn = false;
	var audio_onHover, audio_win, audio_loseOrTie;
	var shake = setInterval(Shake, 5000);
	var aiOptIndex; // This is the optimum index where the ai will move to when utilizing the minimax algorithm
	
	UpdateWinLossTie();
	DefineAudio();
	
	
	$('#btn_newMatch').on('click', function(){
		humanVal = $('#rb_X').prop('checked') ? X : O; // Checks to see if user selected to be X or not
		aiVal = $('#rb_X').prop('checked') ? O : X; // Checks to see if user selected to be X or not
		humanFirstTurn = $('#rb_first').prop('checked') ? true : false; // Checks to see if the user selected to go first or not
		humansTurn = humanFirstTurn ? true : false;
		easy = $('#rb_easy').prop('checked') ? true : false; // Checks to see if the user selected the difficulty to be easy
		matchInProgress = true; // Sets the match to currently in progress
		$('.ttt-square-contents').text(BLANK); // Resets the tic tac toe grid to empty
		$('.ttt-square').removeClass('ttt-win');
		
		if (!humanFirstTurn) { aiTurn(); }
	});
	
	
	$('.ttt-square').on('click', function(){
		var temp = $(this).find(':first-child').text();	
		if (temp != BLANK ) { return; }
		if (humansTurn && matchInProgress){
			$(this).find(':first-child').text(humanVal);
			
			if ( CheckForWin( true, Get_currentState() ) ){ // win
				PerformWinOperations(humanVal);
			
			} else if ( CheckForTie( Get_currentState() ) ){ // tie
				PerformTieOperations();
			
			} else { // neither a win nor tie
				humansTurn = false;
				aiTurn();
			}
		}
	});
	
	
	$('.ttt-square').on('mouseenter', function(){
		if (matchInProgress){
			$(this).addClass('ttt-hover-square');
			audio_onHover.pause(); // pauses any instance of the audio that may be currently playing
			audio_onHover.currentTime = 0; // sets the instance to the beginning
			audio_onHover.play(); // plays the sound
		}
		
	}).on('mouseleave', function(){
		$(this).removeClass('ttt-hover-square');
	});
	
	
	function Shake(){
		if (!matchInProgress){ 
			$('#btn_newMatch').effect('shake'); 
		}
	};
	
	
	// Updates the number of wins, losses and ties visible to the user
	function UpdateWinLossTie(){
		$('#win').text('WINS: ' + win.toString());
		$('#loss').text('LOSSES: ' + loss.toString());
		$('#tie').text('TIES: ' + tie.toString());
	};
	
	
	// Creates an audio html5 element and assigns the associated file to the audio variables
	function DefineAudio(){
		audio_onHover = document.createElement('audio');
		audio_onHover.src = '../sounds/ding.mp3';
		
		audio_win = document.createElement('audio');
		audio_win.src = '../sounds/win.mp3';
		
		audio_loseOrTie = document.createElement('audio');
		audio_loseOrTie.src = '../sounds/loseOrTie.mp3';
	};
	
	
	// Checks to see if the board state given results in a win for this player
	function CheckForWin(human, board){
		var val = human ? humanVal : aiVal;
	
		for (i = 0; i < winningCombos.length; i++){
			if (board[winningCombos[i][0]] == val && 
				board[winningCombos[i][1]] == val &&
				board[winningCombos[i][2]] == val){
				
				return true;
			}
		}
		
		return false;
	};
	
	
	function PerformWinOperations(val){
		var $cell = $('.ttt-square-contents'); // returns the grid elements from left to right, top to bottom
		
		for (i = 0; i < winningCombos.length; i++){
			if ($cell.eq(winningCombos[i][0]).text() == val && 
				$cell.eq(winningCombos[i][1]).text() == val &&
				$cell.eq(winningCombos[i][2]).text() == val){
				
				$cell.eq(winningCombos[i][0]).parent().addClass('ttt-win');
				$cell.eq(winningCombos[i][1]).parent().addClass('ttt-win');
				$cell.eq(winningCombos[i][2]).parent().addClass('ttt-win');
				
				matchInProgress = false;
				humansTurn ? win++ : loss++;
				humansTurn ? audio_win.play() : audio_loseOrTie.play();
				UpdateWinLossTie();
			}
		}
	};
	
	
	// Loops through each index in the array to see if it is blank
	function CheckForTie(board){
		for (var i = 0; i < board.length; i++){
			if (board[i] == BLANK) { return false; }
		}
		
		return true;
	};
	
	
	function PerformTieOperations(){
		matchInProgress = false;
		tie++;
		UpdateWinLossTie();
		audio_loseOrTie.play();
	};
	
	
	// Given a state of the board, returns true if the board is full or a player has won 
	function terminal(state) {
		return CheckForTie(state) || CheckForWin(true, state) || CheckForWin(false, state)
	};
	
	
	// Returns the value of a state of the board
	function score(state) {
		if ( CheckForWin(false, state) ) { // computer wins
			return 10;
		
		} else if ( CheckForWin(true, state)) { // human wins
			return -10;
		
		} else {
			return 0;
		}
	}
	
	
	// Returns an array of the current state of the board
	function Get_currentState(){
		var $cell = $('.ttt-square-contents'); // returns the grid elements from left to right, top to bottom
		var board = [];
		
		$cell.each(function(index, value){
			board.push( $(this).text() );
		});
		
		return board;
	};
	
	
	function aiTurn(){
		
		if (!humansTurn && matchInProgress){
			var $cell = $('.ttt-square-contents'); // returns the grid elements from left to right, top to bottom
			
			if (easy){ // randomize a cell to populate
				var nextMove;
				var isAvailable = true;
				
				while (isAvailable){
					nextMove = Math.floor(Math.random() * (9)); // randomizes a number between 0 and 8 inclusively
					if ( $cell.eq(nextMove).text() == BLANK ){ // move is available
						$cell.eq(nextMove).text(aiVal);
						isAvailable = false;
						
						if ( CheckForWin( false, Get_currentState() ) ){ // win
							PerformWinOperations(aiVal);
						
						} else if ( CheckForTie( Get_currentState() ) ){ // tie
							PerformTieOperations();
						
						} else { // neither a win nor tie
							humansTurn = true;
						}
					}
				}
				
			} else { // use minimax algorithm to find next optimized move
				MiniMaxAlgorithm(Get_currentState(), 0, false); // updates aiOptIndex variable utilizing minimax algorithm for AIs best next move
				$cell.eq(aiOptIndex).text(aiVal);
				
				if ( CheckForWin( false, Get_currentState() ) ){ // win
					PerformWinOperations(aiVal);
				
				} else if ( CheckForTie( Get_currentState() ) ){ // tie
					PerformTieOperations();
				
				} else { // neither a win nor tie
					humansTurn = true;
				}
			}
		}	
	}; // End of aiTurn
	
	
	//  This recursively considers all outcomes and picks the best solution based on the max value returned and updates aiOptIndex variable.  
	//  Computer is the maximizing player and human is minimizing player.
	//  Here is a great example of the algorithm being utilized:  http://ualr.edu/jdray1/ttt.js
	//  Here is an even better explanation of it:  https://www.youtube.com/watch?v=J1GoI5WHBto
	function MiniMaxAlgorithm(board, depth, human){
		if (depth >= MAX_DEPTH || terminal(board)) {
			return score(board);
		}
		
		var maxScore;
		var minScore;
		var scores = [];
		var moves = [];
		var val = human ? humanVal : aiVal;
	
		for (var i = 0; i < board.length; i++){
			if (board[i] == BLANK) {
				var newBoard = board.slice();
				newBoard[i] = val;
				scores.push(MiniMaxAlgorithm(newBoard, depth + 1, !human));
				moves.push(i);
			}
		}
		
		if (!human){ // maximizing player strategy (computer)
			aiOptIndex = moves[0];
			maxScore = scores[0];
			for (var s in scores) {
				if (scores[s] > maxScore) {
					maxScore = scores[s];
					aiOptIndex = moves[s];
				}
			}
			return maxScore;
			
		} else { // minimizing player strategy (human)
			aiOptIndex = moves[0];
			minScore = scores[0];
			for (var s in scores) {
				if (scores[s] < minScore) {
					minScore = scores[s];
					aiOptIndex = moves[s];
				}
			}
			return minScore;
		}
	
	}; // End of MiniMaxAlgorithm
	
});



















