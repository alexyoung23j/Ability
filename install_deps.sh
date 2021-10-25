if [[ -z "${ABILITY_HOME}" ]]; then
   echo "Running activate.sh" 
   source ./activate.sh
fi

yarn global add firebase-tools

cd $ABILITY_HOME/ability-web/
yarn
cd $ABILITY_HOME/ability-web/
cd $ABILITY_HOME/ability-desktop/
yarn
cd $ABILITY_HOME 
