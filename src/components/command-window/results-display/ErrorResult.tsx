import React, { useEffect, useState } from 'react';

interface ErrorResultProps {
  errorType: string;
}

export default function ErrorResult(props: ErrorResultProps) {
  const { errorType } = props;

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: '15px',
        marginBottom: '30px',
      }}
    >
      <div
        style={{
          paddingBottom: '15px',
          paddingLeft: '15px',
          paddingRight: '15px',
          paddingTop: '15px',
          borderRadius: '8px',
          backgroundColor: '#E9E9E9',
        }}
      >
        <div
          className="basicTextClass"
          style={{
            fontSize: '14',
          }}
        >
          Ability is currently unable to perform this query 🙃. Try a closer
          date!
        </div>
      </div>
    </div>
  );
}
