import PageLayout from '../../components/PageLayout'
import css from '../../scss/page.module.scss'

export default function Music() {
	return (
		<PageLayout title="Music">
			<p>A playlist of 600+ songs, and a versatile music player.</p>
			<a href="/music" target="_blank" className={css['go-link']}>
				Check it out
			</a>
		</PageLayout>
	)
}
