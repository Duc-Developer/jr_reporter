import React from 'react'

const Layout = ({ children }) => {
    return (
        <>
            <section className='content mb-8'>{children}</section>
            <section className='footer text-center text-outline text-xl fixed py-2 bottom-0 w-screen'>©2024{" "}
                <a href="https://github.com/Duc-Developer" target='_blank'>
                    David Chan
                </a>.
                All rights reserved.
            </section>
        </>
    )
}

export default Layout