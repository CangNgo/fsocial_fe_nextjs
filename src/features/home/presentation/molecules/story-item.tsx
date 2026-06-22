import React from 'react'

interface StoryItemProps {
  story: any;
}

const StoryItem = ({ story }: StoryItemProps) => {
  return (
    <div>
      <div>{story.content}</div>
    </div>
  )
}

export default StoryItem