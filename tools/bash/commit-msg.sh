#!/usr/bin/env bash

COMMIT_MSG_FILE="$1"
COMMIT_MSG_LINES=
HOOK_EDITOR=
SKIP_DISPLAY_WARNINGS=0
WARNINGS=

#
# Add a warning with <line_number> and <msg>.
#

add_warning() {
  local line_number=$1
  local warning=$2
  WARNINGS[$line_number]="${WARNINGS[$line_number]}$warning;"
}

#
# Output warnings.
#

display_warnings() {
  if [ $SKIP_DISPLAY_WARNINGS -eq 1 ]; then
    # if the warnings were skipped then they should be displayed next time
    SKIP_DISPLAY_WARNINGS=0
    return
  fi

  for i in "${!WARNINGS[@]}"; do
    printf "\n${COMMIT_MSG_LINES[$(($i-1))]} [line ${i}]\n"
    IFS=';' read -ra WARNINGS_ARRAY <<< "${WARNINGS[$i]}"
    for ERROR in "${WARNINGS_ARRAY[@]}"; do
      echo -e " - ${ERROR}"
    done
  done
}

#
# Read the contents of the commit msg into an array of lines.
#

read_commit_message() {
  # reset commit_msg_lines
  COMMIT_MSG_LINES=()

  # read commit message into lines array
  while IFS= read -r; do

    # trim trailing spaces from commit lines
    shopt -s extglob
    REPLY="${REPLY%%*( )}"
    shopt -u extglob

    # ignore all lines after cut line
    [[ $REPLY == "# ------------------------ >8 ------------------------" ]]
    test $? -eq 1 || break

    # ignore comments
    [[ $REPLY =~ ^# ]]
    test $? -eq 0 || COMMIT_MSG_LINES+=("$REPLY")

  done < <(cat $COMMIT_MSG_FILE)
}

#
# Validate the contents of the commmit msg agains the good commit guidelines.
#

validate_commit_message() {
  # reset warnings
  WARNINGS=()

  # capture the subject, and remove the 'squash! ' prefix if present
  COMMIT_SUBJECT=${COMMIT_MSG_LINES[0]/#squash! /}

  # if the commit is empty there's nothing to validate, we can return here
  COMMIT_MSG_STR="${COMMIT_MSG_LINES[*]}"
  test -z "${COMMIT_MSG_STR[*]// }" && return;

  # 1. Separate subject from body with a blank line
  # ------------------------------------------------------------------------------

  test ${#COMMIT_MSG_LINES[@]} -lt 1 || test -z "${COMMIT_MSG_LINES[1]}"
  test $? -eq 0 || add_warning 2 "Separate subject from body with a blank line"

  # 2. Limit the subject line to 70 characters
  # ------------------------------------------------------------------------------

  test "${#COMMIT_SUBJECT}" -le 70
  test $? -eq 0 || add_warning 1 "Limit the subject line to 70 characters (${#COMMIT_SUBJECT} chars)"

  # 3. Capitalize the subject line
  # ------------------------------------------------------------------------------

  [[ ${COMMIT_SUBJECT} =~ ^(\[[[:graph:]|[:space:]]*\])*[[:blank:]]*([[:upper:]]{1}[[:lower:]]*|[[:digit:]]+)([[:blank:]]|[[:punct:]]|$) ]]
  test $? -eq 0 || add_warning 1 "Capitalize the subject line"

  # 4. Do not end the subject line with a period
  # ------------------------------------------------------------------------------

  [[ ${COMMIT_SUBJECT} =~ [^\.]$ ]]
  test $? -eq 0 || add_warning 1 "Do not end the subject line with a period"

  # 5. Use the imperative mood in the subject line
  # ------------------------------------------------------------------------------

  IMPERATIVE_MOOD_BLACKLIST=(
    added          adds          adding
    affixed        affixes       affixing
    adjusted       adjusts       adjusting
    amended        amends        amending
    avoided        avoids        avoiding
    bumped         bumps         bumping
    changed        changes       changing
    checked        checks        checking
    committed      commits       committing
    copied         copies        copying
    corrected      corrects      correcting
    created        creates       creating
    decreased      decreases     decreasing
    deleted        deletes       deleting
    disabled       disables      disabling
    dropped        drops         dropping
    duplicated     duplicates    duplicating
    enabled        enables       enabling
    enhanced       enhances      enhancing
    excluded       excludes      excluding
    extracted      extracts      extracting
    fixed          fixes         fixing
    handled        handles       handling
    implemented    implements    implementing
    improved       improves      improving
    included       includes      including
    increased      increases     increasing
    installed      installs      installing
    introduced     introduces    introducing
    leased         leases        leasing
    managed        manages       managing
    merged         merges        merging
    moved          moves         moving
    normalised     normalises    normalising
    normalized     normalizes    normalizing
    passed         passes        passing
    pointed        points        pointing
    pruned         prunes        pruning
    ran            runs          running
    refactored     refactors     refactoring
    released       releases      releasing
    removed        removes       removing
    renamed        renames       renaming
    replaced       replaces      replacing
    resolved       resolves      resolving
    reverted       reverts       reverting
                   sets          setting
    showed         shows         showing
    swapped        swaps         swapping
    tested         tests         testing
    tidied         tidies        tidying
    updated        updates       updating
    upped          ups           upping
    used           uses          using
  )

  # enable case insensitive match
  shopt -s nocasematch

  for BLACKLISTED_WORD in "${IMPERATIVE_MOOD_BLACKLIST[@]}"; do
    [[ ${COMMIT_SUBJECT} =~ ^[[:blank:]]*$BLACKLISTED_WORD ]]
    test $? -eq 0 && add_warning 1 "Use the imperative mood in the subject line, e.g 'fix' not 'fixes'" && break
  done

  # disable case insensitive match
  shopt -u nocasematch

  # 6. Wrap the body at 72 characters
  # ------------------------------------------------------------------------------

  URL_REGEX='^[[:blank:]]*(https?|ftp|file)://[-A-Za-z0-9\+&@#/%?=~_|!:,.;]*[-A-Za-z0-9\+&@#/%=~_|]'

  for i in "${!COMMIT_MSG_LINES[@]}"; do
    LINE_NUMBER=$((i+1))
    test "${#COMMIT_MSG_LINES[$i]}" -le 72 || [[ ${COMMIT_MSG_LINES[$i]} =~ $URL_REGEX ]]
    test $? -eq 0 || add_warning $LINE_NUMBER "Wrap the body at 72 characters (${#COMMIT_MSG_LINES[$i]} chars)"
  done

  # 7. Do not write single worded commits
  # ------------------------------------------------------------------------------

  COMMIT_SUBJECT_WORDS=(${COMMIT_SUBJECT})
  test "${#COMMIT_SUBJECT_WORDS[@]}" -gt 1
  test $? -eq 0 || add_warning 1 "Do no write single worded commits"

  # 8. Do not start the subject line with whitespace
  # ------------------------------------------------------------------------------

  [[ ${COMMIT_SUBJECT} =~ ^[[:blank:]]+ ]]
  test $? -eq 1 || add_warning 1 "Do not start the subject line with whitespace"
}

while true; do

  read_commit_message

  validate_commit_message

  # if there are no WARNINGS are empty then we're good to break out of here
  test ${#WARNINGS[@]} -eq 0 && exit 0;

  display_warnings

  exit 1

done