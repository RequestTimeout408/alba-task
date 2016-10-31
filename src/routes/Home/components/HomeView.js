import React from 'react'

export const HomeView = () => (
  <div className="text-left">
    <h2>About this project</h2>
    <p>
      The main focus of this project is the mixed 2D/3D rendering of Github language and repo activity.
    </p>
    <p>
      For this project, the activity of a repo is defined as the number of followers is has.
      The activity of a language is defined as the sum of the 30 most active repos that were created after a fixed date.
    </p>
  </div>
)

export default HomeView
