!macro customInstall
  DeleteRegKey HKCR "sumvideo-client"
  WriteRegStr HKCR "sumvideo-client" "" "URL:sumvideo-client"
  WriteRegStr HKCR "sumvideo-client" "URL Protocol" ""
  WriteRegStr HKCR "sumvideo-client\shell" "" ""
  WriteRegStr HKCR "sumvideo-client\shell\Open" "" ""
  WriteRegStr HKCR "sumvideo-client\shell\Open\command" "" "$INSTDIR\${APP_EXECUTABLE_FILENAME} %1"
!macroend

!macro customUnInstall
  DeleteRegKey HKCR "sumvideo-client"
!macroend
