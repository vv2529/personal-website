import PageContainer from '../components/PageContainer'
import { FaYoutube, FaDiscord, FaGithub } from 'react-icons/fa'
import { SiGmail } from 'react-icons/si'

export default function Home() {
	return (
		<PageContainer title="vv2529">
			<p>Hi, I'm Vlad, also known as vv2529 and Motch, welcome to my website.</p>
			<p>Feel free to look around, maybe you'll like some of my projects.</p>
			<p>
				My contacts:
				<ul className="no-bullets">
					<li className="align-center">
						<FaYoutube className="link-icon" />
						<a href="http://youtube.com/channel/UCF6FE8A6PXO2c6eo5o9_LPg" target="_blank">
							Motch
						</a>
					</li>
					<li className="align-center">
						<FaDiscord className="link-icon" />
						Motch#6336
					</li>
					<li className="align-center">
						<SiGmail className="link-icon" />
						<a href="mailto:vv02529@gmail.com">vv02529@gmail.com</a>
					</li>
					<li className="align-center">
						<FaGithub className="link-icon" />
						<a href="http://github.com/vv2529" target="_blank">
							vv2529
						</a>
					</li>
				</ul>
			</p>
		</PageContainer>
	)
}
