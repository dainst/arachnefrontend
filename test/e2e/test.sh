#!/bin/bash
#
# Autor: Daniel M. de Oliveira
#
# Sets up the environment for
# and performs UI testing.
#

### functions ####

function killHttParrot {

 PID=""
 PID=`ps -ef | grep "node.*htt" | grep -v "grep" | awk '{print $2;}'`

 if [ -z $PID ];
 then
  echo HttParrot not running. Nothing to kill. $PID
 else
  echo Killing httParrot. $PID
  kill $PID
 fi
}

function killWebdriver {

  PID=`ps -ef | grep "webdriver.*start" | grep -v "grep" | awk '{print $2;}'`
  if [ -z $PID ];
  then
    echo Webdriver manager not running. Nothing to kill. $PID
  else
   echo killing webdriver manager. $PID.
   kill $PID
  fi

  PID=`ps -ef | grep "selenium.*chrome" | grep -v "grep" | awk '{print $2;}'`
  if [ -z $PID ];
  then
    echo Selenium webdriver chrome not running. Nothing to kill. $PID
  else
    echo Killing webdriver chrome. $PID
    kill $PID
  fi
}


function startWebdriver {

 PID=`ps -ef | grep "webdriver.*start" | grep -v "grep" | awk '{print $2;}'`

 if [ -z $PID ];
 then
  echo Starting webdriver manager.
  webdriver-manager start &
 else
  echo Webdriver manager already started
 fi
}

function startHttParrot {

 PID=""
 PID=`ps -ef | grep "node.*htt" | grep -v "grep" | awk '{print $2;}'`

 if [ -z $PID ];
 then
  echo Starting httParrot.
  node lib/httParrot/httParrot.js &
 else
  echo HttParrot already started.
 fi
}




#### main ####


if [ "$1" = "kill" ]
then
  killHttParrot
  killWebdriver
  exit
fi

karma start test/karma.conf.js
if [ $? -ne 0 ]
then
  echo Unit tests not passed. Will not continue.
  exit 1
fi

startWebdriver
startHttParrot

grunt uitest

