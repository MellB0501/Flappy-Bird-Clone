import { getRandomNumber, getCssProp, detectCollision, roundNum  } from '/utils/utils.js'

Object.assign( window, {
    detectCollision
})

let game, block, hole, character, score, gameoverscreen, star,
gameStopped, isJumping, scoreTotal, gamespeed, gravityStopped

function getElements() {
    game = document.querySelector('#game')
    block = document.querySelector('#block')
    hole = document.querySelector('#hole')
    character = document.querySelector('#character')
    score = document.querySelector('#score')
    gameoverscreen = document.querySelector('#gameoverscreen')
    star = document.querySelector('#star')
}
          
function setInitialValues() {
    gameStopped = false         
    isJumping = false
    isJumping = 0
    scoreTotal = 0
    gamespeed = 'slow'  
    gravityStopped = false       
}

function setEventListeners() {
    window.addEventListener( 'resize', e => {
        if ( gameStopped ) return
        resetAllAnimations()
    })
    gameoverscreen.querySelector( 'button' ).addEventListener( 'click', e => {
        gamespeed = 'slow'
        hideGameoverscreen()
        beginGravity()
        resetAllAnimations()
        resetCharacterPosition()
        resetScore()
        changeScoreUi()
        //startBgAnimation()
        setTimeout(e => {
            gameStopped = false
        })
    })
    document.body.parentElement.addEventListener( 'click', e => {
        if( gameStopped ) return
        characterJump()
    })
    document.onkeypress = e => {
        e = e || window.event

        if (e.keyCode === 32) {
            if (gameStopped) return
            characterJump()
        }
    }
}

function gameOver() {
    (new Audio( '/sounds/gameover.wav' )).play()
    gameStopped = true
    showGameoverscreen()
    stopBlockAnimation()
    startGravity()
    hideStar()
    //stopBgAnimation()
}

function resetCharacterPosition() {
    character.style.top = '  30vh'
    character.style.left = '25vw'
}
function resetScore() {
    scoreTotal = 0
}

function changeScoreUi() {
    score.innerText = `Score ${ scoreTotal.toString() }`
    gameoverscreen.querySelector('.score').innerText = score.innerText
}

const gameSpeedConfig = {
    'slow': 250,
    'normal': 550,
    'fast': 1000,
    'faster': 2000,
    'ridiculous': 5000
}

function resetAllAnimations() {
    const seconds = roundNum(window.innerWidth / gameSpeedConfig[ gamespeed ] )
    const blockAnimationCss = `blockAnimation ${ seconds }s infinite linear`      

    block.style.animation = blockAnimationCss
    hole.style.animation = blockAnimationCss

    if ( star.style.display !== 'none' ) return

    const num = getRandomNumber( 1, 5 )
    const starAnimationCss = `starAnimation${ num } ${ seconds }s infinite linear`
    star.style.animation = starAnimationCss
}

function stopBlockAnimation() {
    const blockLeft = block.getBoundingClientRect().x

    block.style.animation = ''
    hole.style.animation = ''

    block.style.left = `${ blockLeft }px`
    hole.style.left = `${ blockLeft }px`
}

function characterJump() {
    isJumping = true
    let jumpCount = 0

    const jumpInterval = setInterval( e => {
        changedGameState( {diff: -3, direction: 'up' })

        if ( jumpCount > 20 ) {
            (new Audio( '/sounds/flying.wav' )).play()
            clearInterval( jumpInterval)
            isJumping = false
            jumpCount = 0
        }

        jumpCount++
    }, 10)
}

function changedGameState({diff, direction}) {
    handleStarDetection()
    handleGameSpeed()
    handleCharacterAnimation( direction )
    handleCharacterCollisions()
    handleCharacterPosition( diff )
}

function handleStarDetection() {
    if ( star.style.display === 'none' ) return

    if ( detectCollision( character, star )) {
        (new Audio( '/sounds/collectstar.wav' )).play()
        scoreTotal += 150
        hideStar() 
        changeScoreUi()
    }
}

function handleGameSpeed() {
    let doReset = false
    if ( scoreTotal > 5000 ) {
        gamespeed = 'ridiculous'
        doReset = true
    }
    else if ( scoreTotal > 2000 ) {
        gamespeed = 'faster'
        doReset = true
    }
    else if ( scoreTotal > 1000 ) {
        gamespeed = 'fast'
        doReset = true
    }
    else if ( scoreTotal > 550 ) {
        gamespeed = 'normal'
    }
    else if ( scoreTotal > 250 ) {
        gamespeed = 'slow'
        doReset = true
    }
    if ( doReset ) {
        const timeoutLength = gameSpeedConfig[ gamespeed ] * ( gameSpeedConfig[ gamespeed ] / 10 )
        setTimeout( e => {
            if ( gameStopped ) return
        
            resetAllAnimations()
        }) //timeoutLength)
    }
}

function handleCharacterAnimation( direction ) {
    if ( direction === 'down' ){
        character.classList.remove( 'go-up')
        character.classList.add( 'go-down')
    }
    else if ( direction === 'up' ){
        character.classList.add( 'go-up')
        character.classList.remove( 'go-down')
    }
}

let numOfHoles = 0
let soundCount = 0

function handleCharacterCollisions() {
    const collisionBlock = detectCollision( character, block )
    const collisionHole = detectCollision( character, hole, { y1:-46, y2:47 })

    if ( collisionBlock && !collisionHole ) {
        changeScoreUi()
        return gameOver()
    }

    else if ( collisionHole ) {
        scoreTotal++

        soundCount++
        if ( soundCount > 35 ) {
            (new Audio( '/sounds/zap.wav' )).play()
            soundCount = 0
        }

        changeScoreUi()

        if ( gameStopped ) return

        numOfHoles++
        if ( numOfHoles > 150 ) {
            numOfHoles = 0

            showStar()
            setTimeout( e => hideStar(), 10000 )
        }
    }
}

function handleCharacterPosition( diff ) {
    const characterTop = parseInt( getCssProp(character, 'top'))
    const changeTop = characterTop + diff

    if (changeTop < 0 ) {
        return
    }

    if ( changeTop > window.innerHeight ) {
        return gameOver()
    }

    character.style.top = `${ changeTop }px`
}

function initRandomHoles() {
    hole.addEventListener('animationiteration', e => {
        const fromHeight = 60 * window.innerHeight / 100
        const toHeight = 95 * window.innerHeight / 100

        const randomTop = getRandomNumber(400, 650)
        hole.style.top = `-${ randomTop }px`
    })
}

function beginGravity() {
    setInterval(e => {
        if ( isJumping || gameStopped ) return
        changedGameState({ diff: 5, direction: 'down' })
    }, 20)
}

function startGravity () {
    gravityStopped = true
}

function showGameoverscreen() {
    gameoverscreen.style.display = ''
}

function hideGameoverscreen() {
    gameoverscreen.style.display = 'none'
}

function showStar() {
    if ( star.style.display !== 'none' ) return

    star.style.display = ''
    star.style.top = `${ getRandomNumber ( 20, 70)}%`
}

function hideStar() {
    star.style.display = 'none'
} 

function gameInit() {   
    getElements()
    setInitialValues()
    beginGravity()    
    initRandomHoles()
    setEventListeners()
    resetAllAnimations()
}

gameInit()
