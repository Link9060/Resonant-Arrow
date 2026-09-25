import React from 'react';

/**
 * Exact Beacon mark from Resonant-Waypoint/src/components/beacon-icon.tsx,
 * adapted from TSX to JSX for the ARROW cinematic.
 */
export function WaypointMark({size=48,active=true,className='',style}){
  return <svg
    className={'waypoint-mark '+(active?'is-active ':'')+className}
    style={style}
    width={size}
    height={size}
    viewBox="0 0 48 48"
    fill="none"
    aria-hidden="true"
  >
    <circle cx="24" cy="24" r="15.5" stroke="currentColor" strokeOpacity=".24"/>
    <circle cx="24" cy="24" r="9.5" stroke="currentColor" strokeOpacity=".48"/>
    <circle cx="24" cy="24" r="3.75" fill="currentColor"/>
  </svg>;
}
