import { timeSince } from './timeFormat'

export const applyMessage = (data: any) => {
	// if (data.sender !== $userName) {
	const textMessages: any = document.getElementById('textMessages')

	const div = document.createElement('div')
	div.classList.add('text')
	// div.classList.add('newText')
	div.classList.add('yoMe')
	const p = document.createElement('p')
	const span1 = document.createElement('span')
	span1.style.color = 'var(--secondary)'
	span1.innerText = data.sender + '; '
	const span2 = document.createElement('span')
	span2.style.color = 'var(--secondaryThemeInverted)'
	span2.innerText = data.message

	const span3 = document.createElement('span')
	span3.classList.add('spanFlexRight')

	const span4 = document.createElement('span')
	span4.classList.add('timeSpan')
	span4.innerText = timeSince(data.createdAt)
	span3.append(span4)

	const span5 = document.createElement('span')
	span5.classList.add('timeSpan')
	span5.classList.add('likeSPan')
	span5.style.marginLeft = '10px'
	// span3.append(span5)

	p.appendChild(span1)
	p.appendChild(span2)
	p.appendChild(span3)
	div.appendChild(p)

	textMessages.appendChild(div)
}

export const applyNavDataMessage = (data: any) => {}
